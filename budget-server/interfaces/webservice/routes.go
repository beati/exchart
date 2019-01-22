package webservice

import (
	"github.com/go-chi/chi"

	"bitbucket.org/beati/budget/budget-server/usecases"
	"bitbucket.org/beati/effero/effero/session"
)

// Routes returns a router configured with all api endpoints.
func Routes(
	allowedOrigins []string,
	sessionManager *session.Manager,
	userIntercator *usecases.UserInteractor,
) chi.Router {
	checkOrigin := checkOriginMiddleware(allowedOrigins)
	auth := authMiddleware(sessionStore)
	uapi := newUserAPI(sessionStore, userIntercator)

	r := chi.NewRouter()
	r.Use(checkOrigin)
	r.Use(contentTypeJSON)
	uapi.routes(r, auth)
	return r
}
