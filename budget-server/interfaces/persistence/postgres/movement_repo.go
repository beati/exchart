package postgres

import "bitbucket.org/beati/budget/budget-server/domain"

// GetMovement implements domain.CategoryTx.
func (tx Tx) GetMovement(movementID domain.EntityID) (*domain.Movement, error) {
	movement := &domain.Movement{}
	err := tx.sqlTx.Collection("movements").Find("movement_id", movementID).One(movement)
	return movement, err
}

// AddMovement implements domain.CategoryTx.
func (tx Tx) AddMovement(movement *domain.Movement) error {
	movementID, err := tx.sqlTx.Collection("movements").Insert(movement)
	if err != nil {
		return err
	}
	movement.ID = domain.EntityID(movementID.(int64))
	return nil
}

// UpdateMovement implements domain.CategoryTx.
func (tx Tx) UpdateMovement(movement *domain.Movement) error {
	return tx.sqlTx.Collection("movements").Find("movement_id", movement.ID).Update(movement)
}

// DeleteMovement implements domain.CategoryTx.
func (tx Tx) DeleteMovement(movementID domain.EntityID) error {
	return tx.sqlTx.Collection("movements").Find("movement_id", movementID).Delete()
}
