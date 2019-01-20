package webservice

import (
	"github.com/go-chi/chi"

	"bitbucket.org/beati/budget/budget-server/lib/session"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

// Routes returns a router configured with all api endpoints.
func Routes(
	allowedOrigins []string,
	sessionStore *session.Manager,
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
