package domain

type JointAccount struct {
	AccountID1 EntityID `db:"account_id_1"`
	AccountID2 EntityID `db:"account_id_2"`
}
