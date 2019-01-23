package webservice

import (
	"context"
	"encoding/json"
	"net/http"
	"net/url"

	"github.com/go-chi/chi"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/interfaces/session"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

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

type userAPI struct {
	sessionManager *session.Manager
	userInteractor *usecases.UserInteractor
}

func newUserAPI(sessionManager *session.Manager, userInteractor *usecases.UserInteractor) *userAPI {
	return &userAPI{
		sessionManager: sessionManager,
		userInteractor: userInteractor,
	}
}

func (uapi *userAPI) addUser(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
		Name     string `json:name`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, uapi.userInteractor.AddUser(
		r.Context(),
		params.Email,
		params.Password,
		params.Name,
	)
}

func (uapi *userAPI) verifyEmail(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		ID     domain.EntityID `json:"id"`
		Action string          `json:"action"`
		Token  string          `json:"token"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	switch params.Action {
	case "verify":
		return nil, uapi.userInteractor.VerifyUserEmail(r.Context(), params.ID, params.Token)
	case "cancel":
		return nil, uapi.userInteractor.CancelUserEmail(r.Context(), params.ID, params.Token)
	default:
		return nil, domain.ErrBadParameters
	}
}

func (uapi *userAPI) changeEmail(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Password string `json:"password"`
		Email    string `json:"email"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	session := getSessionData(r)

	return nil, uapi.userInteractor.ChangeUserEmail(r.Context(), session.UserID, params.Password, params.Email)
}

func (uapi *userAPI) changePassword(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		OldPassword string `json:"old_password"`
		NewPassword string `json:"new_password"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	session := getSessionData(r)

	return nil, uapi.userInteractor.ChangePassword(r.Context(), session.UserID, params.OldPassword, params.NewPassword)
}

func (uapi *userAPI) requestPasswordReset(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Email string `json:"email"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, uapi.userInteractor.RequestPasswordReset(r.Context(), params.Email)
}

func (uapi *userAPI) resetPassword(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		ID       domain.EntityID `json:"id"`
		Password string          `json:"password"`
		Token    string          `json:"token"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, uapi.userInteractor.ResetPassword(r.Context(), params.ID, params.Token, params.Password)
}

func (uapi *userAPI) authenticate(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	user, err := uapi.userInteractor.Authenticate(r.Context(), params.Email, params.Password)
	if err != nil {
		return nil, err
	}

	s := sessionData{
		UserID:    user.ID,
		AccountID: user.AccountID,
	}

	return nil, uapi.sessionManager.New(user.ID, w, &s)
}

func (uapi *userAPI) unauthenticate(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	return nil, uapi.sessionManager.Clear(w)
}

func (uapi *userAPI) routes(r chi.Router, authMiddleware func(http.Handler) http.Handler) {
	rateLimited := chi.NewRouter()

	user := chi.NewRouter()
	user.Post("/", wrap(uapi.addUser))
	user.With(authMiddleware).Post("/password", wrap(uapi.changePassword))
	user.With(authMiddleware).Post("/email", wrap(uapi.changeEmail))
	rateLimited.Mount("/user", user)

	validate := chi.NewRouter()
	validate.Post("/", wrap(uapi.verifyEmail))
	rateLimited.Mount("/email", validate)

	password := chi.NewRouter()
	password.Post("/request_reset", wrap(uapi.requestPasswordReset))
	password.Post("/reset", wrap(uapi.resetPassword))
	rateLimited.Mount("/password", password)

	auth := chi.NewRouter()
	auth.With(authMiddleware).Get("/", wrap(func(w http.ResponseWriter, r *http.Request) (interface{}, error) {
		return nil, nil
	}))
	auth.Post("/", wrap(uapi.authenticate))
	auth.With(authMiddleware).Delete("/", wrap(uapi.unauthenticate))
	rateLimited.Mount("/auth", auth)

	r.Mount("/user", rateLimited)
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
