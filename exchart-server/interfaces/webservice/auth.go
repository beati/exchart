package webservice

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/go-chi/chi"

	"github.com/beati/exchart/exchart-server/domain"
	"github.com/beati/exchart/exchart-server/interfaces/session"
	"github.com/beati/exchart/exchart-server/usecases"
)

type authAPI struct {
	sessionManager *session.Manager
	userInteractor *usecases.UserInteractor
}

func newAuthAPI(sessionManager *session.Manager, userInteractor *usecases.UserInteractor) *authAPI {
	return &authAPI{
		sessionManager: sessionManager,
		userInteractor: userInteractor,
	}
}

func (aapi *authAPI) authenticate(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Email    string
		Password string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	user, err := aapi.userInteractor.Authenticate(r.Context(), params.Email, params.Password)
	if err != nil {
		return nil, err
	}

	s := sessionData{
		UserID:    user.ID,
		AccountID: user.AccountID,
	}

	return nil, aapi.sessionManager.New(user.ID, w, &s)
}

func (aapi *authAPI) unauthenticate(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	return nil, aapi.sessionManager.Clear(w)
}

func (aapi *authAPI) routes(r chi.Router, authMiddleware func(http.Handler) http.Handler) {
	auth := chi.NewRouter()
	auth.With(authMiddleware).Get("/", wrap(func(w http.ResponseWriter, r *http.Request) (interface{}, error) {
		return nil, nil
	}))
	auth.Post("/", wrap(aapi.authenticate))
	auth.Delete("/", wrap(aapi.unauthenticate))
	r.Mount("/auth", auth)
}

type sessionData struct {
	UserID    domain.EntityID
	AccountID domain.EntityID
}

var sessionDataContextKey = &contextKey{"session_data"}

func newContextWithSessionData(ctx context.Context, s sessionData) context.Context {
	return context.WithValue(ctx, sessionDataContextKey, s)
}

func getSessionData(r *http.Request) sessionData {
	return r.Context().Value(sessionDataContextKey).(sessionData)
}

func authMiddleware(sessionManager *session.Manager) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return &authHandler{
			handler:        h,
			sessionManager: sessionManager,
		}
	}
}

type authHandler struct {
	handler        http.Handler
	sessionManager *session.Manager
}

func (h *authHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	s := sessionData{}
	userID, err := h.sessionManager.Get(r, &s)
	if err == domain.ErrNotAllowed {
		w.WriteHeader(http.StatusForbidden)
		return
	} else if err != nil {
		Logger(r).WithField("code", http.StatusInternalServerError).Error(err)
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	s.UserID = userID

	h.handler.ServeHTTP(w, r.WithContext(newContextWithSessionData(r.Context(), s)))
}

func checkOriginMiddleware(allowedOrigins []string) func(http.Handler) http.Handler {
	return func(h http.Handler) http.Handler {
		return &checkOriginHandler{
			handler:        h,
			allowedOrigins: allowedOrigins,
		}
	}
}

type checkOriginHandler struct {
	handler        http.Handler
	allowedOrigins []string
}

func (h *checkOriginHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	var originURL *url.URL
	var err error

	allowed := false
	origin := r.Header.Get("Origin")

	if origin == "" {
		allowed = true
		goto done
	}

	originURL, err = url.Parse(origin)
	if err != nil {
		goto done
	}
	if originURL.Scheme != "https" {
		goto done
	}

	for _, allowedOrigin := range h.allowedOrigins {
		if originURL.Host == allowedOrigin {
			allowed = true
			goto done
		}
	}

done:
	if !allowed {
		w.WriteHeader(http.StatusUnauthorized)
		return
	}
	h.handler.ServeHTTP(w, r)
}
