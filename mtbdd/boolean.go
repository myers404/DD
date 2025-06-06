package mtbdd

func (mtbdd *MTBDD) NOT(x NodeRef) NodeRef {
	return mtbdd.ITECore(x, FalseRef, TrueRef)
}

func (mtbdd *MTBDD) AND(x, y NodeRef) NodeRef {
	return mtbdd.ITECore(x, y, FalseRef)
}

func (mtbdd *MTBDD) OR(x, y NodeRef) NodeRef {
	return mtbdd.ITECore(x, TrueRef, y)
}

func (mtbdd *MTBDD) XOR(x, y NodeRef) NodeRef {
	notY := mtbdd.ITECore(y, FalseRef, TrueRef)
	return mtbdd.ITECore(x, notY, y)
}

func (mtbdd *MTBDD) IMPLIES(x, y NodeRef) NodeRef {
	return mtbdd.ITECore(x, y, TrueRef)
}

func (mtbdd *MTBDD) EQUIV(x, y NodeRef) NodeRef {
	notY := mtbdd.ITECore(y, FalseRef, TrueRef)
	return mtbdd.ITECore(x, y, notY)
}

func (mtbdd *MTBDD) ITE(condition, thenNode, elseNode NodeRef) NodeRef {
	return mtbdd.ITECore(condition, thenNode, elseNode)
}
