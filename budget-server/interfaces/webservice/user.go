package webservice

import (
	"encoding/json"
	"net/http"

	"github.com/go-chi/chi"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/interfaces/session"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

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
		Email    string
		Password string
		Name     string
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
		ID     domain.EntityID
		Action string
		Token  string
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
		Password string
		Email    string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	session := getSessionData(r)

	err = uapi.userInteractor.ChangeUserEmail(r.Context(), session.UserID, params.Password, params.Email)

	err = uapi.sessionManager.Revoke(session.UserID)
	if err != nil {
		return nil, err
	}

	return nil, uapi.sessionManager.New(session.UserID, w, &session)
}

func (uapi *userAPI) changePassword(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		CurrentPassword string
		NewPassword     string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	session := getSessionData(r)

	err = uapi.userInteractor.ChangePassword(r.Context(), session.UserID, params.CurrentPassword, params.NewPassword)
	if err != nil {
		return nil, err
	}

	err = uapi.sessionManager.Revoke(session.UserID)
	if err != nil {
		return nil, err
	}

	return nil, uapi.sessionManager.New(session.UserID, w, &session)
}

func (uapi *userAPI) requestPasswordReset(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		Email string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, uapi.userInteractor.RequestPasswordReset(r.Context(), params.Email)
}

func (uapi *userAPI) resetPassword(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	params := struct {
		ID       domain.EntityID
		Password string
		Token    string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	err = uapi.userInteractor.ResetPassword(r.Context(), params.ID, params.Token, params.Password)
	if err != nil {
		return nil, err
	}

	return nil, uapi.sessionManager.Revoke(params.ID)
}

func (uapi *userAPI) routes(r chi.Router, authMiddleware func(http.Handler) http.Handler) {
	user := chi.NewRouter()
	user.Post("/", wrap(uapi.addUser))
	user.With(authMiddleware).Post("/password", wrap(uapi.changePassword))
	user.With(authMiddleware).Post("/email", wrap(uapi.changeEmail))
	user.Post("/email/verify", wrap(uapi.verifyEmail))
	user.Post("/password/request_reset", wrap(uapi.requestPasswordReset))
	user.Post("/password/reset", wrap(uapi.resetPassword))
	r.Mount("/user", user)
}
