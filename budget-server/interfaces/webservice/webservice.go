package webservice

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi"

	"bitbucket.org/beati/budget/budget-server/domain"
	"bitbucket.org/beati/budget/budget-server/usecases"
)

type budgetAPI struct {
	budgetInteractor *usecases.BudgetInteractor
}

func newBudgetAPI(budgetInteractor *usecases.BudgetInteractor) *budgetAPI {
	return &budgetAPI{
		budgetInteractor: budgetInteractor,
	}
}

func (bapi *budgetAPI) getAccount(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	return bapi.budgetInteractor.GetAccount(r.Context(), session.AccountID)
}

func (bapi *budgetAPI) updateAccount(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	params := struct {
		Name string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.UpdateAccount(r.Context(), session.AccountID, params.Name)
}

func (bapi *budgetAPI) addJointBudget(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	params := struct {
		Email string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return bapi.budgetInteractor.AddJointBudget(r.Context(), session.AccountID, params.Email)
}

func (bapi *budgetAPI) acceptJointBudget(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	budgetID, err := domain.ParseEntityID(chi.URLParam(r, "budgetID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.AcceptJointBudget(r.Context(), session.AccountID, budgetID)
}

func (bapi *budgetAPI) disableJointBudget(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	budgetID, err := domain.ParseEntityID(chi.URLParam(r, "budgetID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.DisableJointBudget(r.Context(), session.AccountID, budgetID)
}

func (bapi *budgetAPI) addCategory(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	params := struct {
		BudgetID domain.EntityID
		Type     domain.CategoryType
		Name     string
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return bapi.budgetInteractor.AddCategory(r.Context(), session.AccountID, params.BudgetID, params.Type, params.Name)
}

func (bapi *budgetAPI) updateCategory(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	categoryID, err := domain.ParseEntityID(chi.URLParam(r, "categoryID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	params := struct {
		Name string
	}{}
	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.UpdateCategory(r.Context(), session.AccountID, categoryID, params.Name)
}

func (bapi *budgetAPI) deleteCategory(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	categoryID, err := domain.ParseEntityID(chi.URLParam(r, "categoryID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.DeleteCategory(r.Context(), session.AccountID, categoryID)
}

func (bapi *budgetAPI) getMovements(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	budgetID, err := domain.ParseEntityID(chi.URLParam(r, "budgetID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	yearString := r.URL.Query().Get("year")
	monthString := r.URL.Query().Get("month")

	var movements []domain.Movement

	if yearString != "" {
		var year int
		year, err = strconv.Atoi(yearString)
		if err != nil {
			return nil, domain.ErrBadParameters
		}
		if monthString != "" {
			var month int
			month, err = strconv.Atoi(monthString)
			if err != nil {
				return nil, domain.ErrBadParameters
			}
			movements, err = bapi.budgetInteractor.GetMovementsByMonth(r.Context(), session.AccountID, budgetID, year, time.Month(month))
		} else {
			movements, err = bapi.budgetInteractor.GetMovementsByYear(r.Context(), session.AccountID, budgetID, year)
		}
	} else {
		movements, err = bapi.budgetInteractor.GetMovements(r.Context(), session.AccountID, budgetID)
	}

	return struct {
		Movements []domain.Movement
	}{movements}, err
}

func (bapi *budgetAPI) addMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	params := struct {
		CategoryID domain.EntityID
		Amount     int64
		Year       int
		Month      time.Month
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return bapi.budgetInteractor.AddMovement(r.Context(), session.AccountID, params.CategoryID, params.Amount, params.Year, params.Month)
}

func (bapi *budgetAPI) updateMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	movementID, err := domain.ParseEntityID(chi.URLParam(r, "movementID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	params := struct {
		CategoryID domain.EntityID
		Year       int
		Month      time.Month
	}{}
	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.UpdateMovement(r.Context(), session.AccountID, movementID, params.CategoryID, params.Year, params.Month)
}

func (bapi *budgetAPI) deleteMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	movementID, err := domain.ParseEntityID(chi.URLParam(r, "movementID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.DeleteMovement(r.Context(), session.AccountID, movementID)
}

func (bapi *budgetAPI) getRecurringMovements(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	budgetID, err := domain.ParseEntityID(chi.URLParam(r, "budgetID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	yearString := r.URL.Query().Get("year")
	monthString := r.URL.Query().Get("month")

	var movements []domain.RecurringMovement

	if yearString != "" {
		var year int
		year, err = strconv.Atoi(yearString)
		if err != nil {
			return nil, domain.ErrBadParameters
		}
		if monthString != "" {
			var month int
			month, err = strconv.Atoi(monthString)
			if err != nil {
				return nil, domain.ErrBadParameters
			}
			movements, err = bapi.budgetInteractor.GetRecurringMovementsByMonth(r.Context(), session.AccountID, budgetID, year, time.Month(month))
		} else {
			movements, err = bapi.budgetInteractor.GetRecurringMovementsByYear(r.Context(), session.AccountID, budgetID, year)
		}
	} else {
		movements, err = bapi.budgetInteractor.GetRecurringMovements(r.Context(), session.AccountID, budgetID)
	}

	return struct {
		Movements []domain.RecurringMovement
	}{movements}, err
}

func (bapi *budgetAPI) addRecurringMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	params := struct {
		CategoryID domain.EntityID
		Amount     int64
		Period     domain.Period
		FirstYear  int
		FirstMonth time.Month
	}{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return bapi.budgetInteractor.AddRecurringMovement(r.Context(), session.AccountID, params.CategoryID, params.Amount, params.Period, params.FirstYear, params.FirstMonth)
}

func (bapi *budgetAPI) updateRecurringMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	movementID, err := domain.ParseEntityID(chi.URLParam(r, "movementID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	params := struct {
		CategoryID domain.EntityID
		FirstYear  int
		FirstMonth time.Month
		LastYear   int
		LastMonth  time.Month
	}{}
	err = json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.UpdateRecurringMovement(r.Context(), session.AccountID, movementID, params.CategoryID, params.FirstYear, params.FirstMonth, params.LastYear, params.LastMonth)
}

func (bapi *budgetAPI) deleteRecurringMovement(w http.ResponseWriter, r *http.Request) (interface{}, error) {
	session := getSessionData(r)

	movementID, err := domain.ParseEntityID(chi.URLParam(r, "movementID"))
	if err != nil {
		return nil, domain.ErrBadParameters
	}

	return nil, bapi.budgetInteractor.DeleteRecurringMovement(r.Context(), session.AccountID, movementID)
}

func (bapi *budgetAPI) routes(r chi.Router) {
	account := chi.NewRouter()
	account.Get("/", wrap(bapi.getAccount))
	account.Post("/", wrap(bapi.updateAccount))
	r.Mount("/account", account)

	budget := chi.NewRouter()
	budget.Post("/", wrap(bapi.addJointBudget))
	budget.Post("/{budgetID}", wrap(bapi.acceptJointBudget))
	budget.Delete("/{budgetID}", wrap(bapi.disableJointBudget))
	r.Mount("/budget", budget)

	category := chi.NewRouter()
	category.Post("/", wrap(bapi.addCategory))
	category.Post("/{categoryID}", wrap(bapi.updateCategory))
	category.Delete("/{categoryID}", wrap(bapi.deleteCategory))
	r.Mount("/category", category)

	movement := chi.NewRouter()
	movement.Get("/{budgetID}", wrap(bapi.getMovements))
	movement.Post("/", wrap(bapi.addMovement))
	movement.Post("/{movementID}", wrap(bapi.updateMovement))
	movement.Delete("/{movementID}", wrap(bapi.deleteMovement))
	r.Mount("/movement", movement)

	recurringMovement := chi.NewRouter()
	recurringMovement.Get("/{budgetID}", wrap(bapi.getRecurringMovements))
	recurringMovement.Post("/", wrap(bapi.addRecurringMovement))
	recurringMovement.Post("/{movementID}", wrap(bapi.updateRecurringMovement))
	recurringMovement.Delete("/{movementID}", wrap(bapi.deleteRecurringMovement))
	r.Mount("/recurring_movement", recurringMovement)
}
