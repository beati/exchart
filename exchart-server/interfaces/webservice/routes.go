package webservice

import (
	"github.com/go-chi/chi"

	"github.com/beati/exchart/exchart-server/interfaces/session"
	"github.com/beati/exchart/exchart-server/usecases"
)

// Routes returns a router configured with all api endpoints.
func Routes(
	allowedOrigins []string,
	sessionManager *session.Manager,
	userIntercator *usecases.UserInteractor,
	budgetInteractor *usecases.BudgetInteractor,
) chi.Router {
	checkOrigin := checkOriginMiddleware(allowedOrigins)
	auth := authMiddleware(sessionManager)
	authAPI := newAuthAPI(sessionManager, userIntercator)
	userAPI := newUserAPI(sessionManager, userIntercator)
	budgetAPI := newBudgetAPI(budgetInteractor)

	r := chi.NewRouter()
	r.Use(checkOrigin)
	r.Use(contentTypeJSON)
	authAPI.routes(r, auth)
	userAPI.routes(r, auth)
	budgetAPI.routes(r.With(auth))
	return r
}
