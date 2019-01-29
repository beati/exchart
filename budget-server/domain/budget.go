package domain

type Budget struct {
	BudgetID   EntityID `db:"budget_id"`
	Main       bool     `db:"main"`
	AccountID1 EntityID `db:"account_id_1"`
	AccountID2 EntityID `db:"account_id_2"`
}
