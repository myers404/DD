package mtbdd

func (mtbdd *MTBDD) EX(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	return mtbdd.Preimage(phi, transition, currentVars, nextVars)
}

func (mtbdd *MTBDD) EF(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	bottom := mtbdd.Constant(false)
	return mtbdd.LeastFixpoint(func(current NodeRef) NodeRef {
		exCurrent := mtbdd.EX(current, transition, currentVars, nextVars)
		return mtbdd.OR(phi, exCurrent)
	}, bottom)
}

func (mtbdd *MTBDD) EG(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	top := phi
	return mtbdd.GreatestFixpoint(func(current NodeRef) NodeRef {
		exCurrent := mtbdd.EX(current, transition, currentVars, nextVars)
		return mtbdd.AND(phi, exCurrent)
	}, top)
}

func (mtbdd *MTBDD) EU(phi, psi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	bottom := mtbdd.Constant(false)
	return mtbdd.LeastFixpoint(func(current NodeRef) NodeRef {
		exCurrent := mtbdd.EX(current, transition, currentVars, nextVars)
		phiAndEx := mtbdd.AND(phi, exCurrent)
		return mtbdd.OR(psi, phiAndEx)
	}, bottom)
}

func (mtbdd *MTBDD) AX(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	notPhi := mtbdd.NOT(phi)
	exNotPhi := mtbdd.EX(notPhi, transition, currentVars, nextVars)
	return mtbdd.NOT(exNotPhi)
}

func (mtbdd *MTBDD) AF(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	notPhi := mtbdd.NOT(phi)
	egNotPhi := mtbdd.EG(notPhi, transition, currentVars, nextVars)
	return mtbdd.NOT(egNotPhi)
}

func (mtbdd *MTBDD) AG(phi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	notPhi := mtbdd.NOT(phi)
	efNotPhi := mtbdd.EF(notPhi, transition, currentVars, nextVars)
	return mtbdd.NOT(efNotPhi)
}

func (mtbdd *MTBDD) AU(phi, psi, transition NodeRef, currentVars, nextVars []string) NodeRef {
	afPsi := mtbdd.AF(psi, transition, currentVars, nextVars)

	notPsi := mtbdd.NOT(psi)
	notPhi := mtbdd.NOT(phi)
	notPhiAndNotPsi := mtbdd.AND(notPhi, notPsi)

	eNotPsiUntilBad := mtbdd.EU(notPsi, notPhiAndNotPsi, transition, currentVars, nextVars)
	notENotPsiUntilBad := mtbdd.NOT(eNotPsiUntilBad)

	return mtbdd.AND(afPsi, notENotPsiUntilBad)
}
