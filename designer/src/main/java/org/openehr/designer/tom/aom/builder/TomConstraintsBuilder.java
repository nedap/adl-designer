/*
 * ADL2-core
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-core.
 *
 * ADL2-core is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

package org.openehr.designer.tom.aom.builder;

import org.apache.commons.lang.SerializationUtils;
import org.openehr.designer.tom.constraint.*;
import org.openehr.jaxb.am.*;

import java.util.List;
import java.util.stream.Collectors;

import static org.openehr.designer.WtUtils.overrideNodeId;
import static org.openehr.adl.am.AmObjectFactory.newCAttribute;

/**
 * @author Marko Pipan
 */
public class TomConstraintsBuilder {
    private final FlatArchetype archetypeParent;
    private final DifferentialArchetype archetype;

    public TomConstraintsBuilder(FlatArchetype archetypeParent, DifferentialArchetype archetype) {
        this.archetypeParent = archetypeParent;
        this.archetype = archetype;
    }

    public void build(CComplexObject target, CComplexObjectTom tom, CComplexObject parent) {
        for (ConstraintTom childTom : tom.getChildren()) {
            addConstraint(target, childTom, parent);
        }
    }

    private CAttribute findCAttribute(List<CAttribute> attributes, String name) {
        for (CAttribute attribute : attributes) {
            if (attribute.getRmAttributeName().equals(name)) return attribute;
        }
        return null;
//        throw new IllegalStateException("Attribute name not in parent: " + name);
    }


    private void addConstraint(CComplexObject target, ConstraintTom tom, CComplexObject parent) {
        if (tom instanceof TupleConstraintTom) {
            CAttributeTuple parentTuple = findCTuple(parent.getAttributeTuples(), ((TupleConstraintTom) tom).getMembers());
            addTupleConstraint(target, (TupleConstraintTom) tom, parentTuple);
        } else {
            final CAttribute attr = findCAttribute(parent.getAttributes(), tom.getAttribute());
            addAttributeConstraint(target, tom, attr!=null?attr.getChildren().get(0):null);
        }

    }

    private void addTupleConstraint(CComplexObject target, TupleConstraintTom tom, CAttributeTuple parentTuple) {
        List<ObjectTupleConstraintTom> children = tom.getChildren();
        CAttributeTuple newTuple = new CAttributeTuple();
        for (String member : tom.getMembers()) {
            newTuple.getMembers().add(newCAttribute(member, null, null, null));
        }


        boolean anyOverride = false;
        for (int i = 0; i < children.size(); i++) {
            ObjectTupleConstraintTom objectTupleTom = children.get(i);
            if (!objectTupleTom.isPresent()) {
                anyOverride = true;
                continue;
            }

            CObjectTuple parentObjectTuple = parentTuple.getChildren().get(i);
            CObjectTuple newObjectTuple = new CObjectTuple();
            for (int j = 0; j < objectTupleTom.getMembers().size(); j++) {
                ConstraintTom constraintTom = objectTupleTom.getMembers().get(j);
                CPrimitiveObject parentConstraint = j<parentObjectTuple.getMembers().size()?parentObjectTuple.getMembers().get(j):null;
                CPrimitiveObject constraint = (CPrimitiveObject) createConstraint(constraintTom, parentConstraint);
                if (constraint == null) {
                    constraint = (CPrimitiveObject) SerializationUtils.clone(parentConstraint);
                } else {
                    anyOverride = true;
                }
                newObjectTuple.getMembers().add(constraint);
            }
            newTuple.getChildren().add(newObjectTuple);
        }

        if (anyOverride) {
            target.getAttributeTuples().add(newTuple);
        }
    }

    private CAttributeTuple findCTuple(List<CAttributeTuple> tuples, List<String> members) {
        for (CAttributeTuple tuple : tuples) {
            List<String> parentMembers = tuple.getMembers().stream().map(CAttribute::getRmAttributeName).collect(Collectors.toList());
            if (members.equals(parentMembers)) {
                return tuple;
            }
        }
        throw new AssertionError("No such parent tuple: " + members);
    }


    private void addAttributeConstraint(CComplexObject target, ConstraintTom tom, CObject parentConstraint) {
//        CAttribute parentAttribute = findCAttribute(parent.getAttributes(), tom.getAttribute());

        CObject cobj = createConstraint(tom, parentConstraint);

        if (cobj == null) return;
        CAttribute result = new CAttribute();
        result.setRmAttributeName(tom.getAttribute());
        result.getChildren().add(cobj);
        target.getAttributes().add(result);
    }

    private CObject createConstraint(ConstraintTom tom, CObject parent) {
        if (tom instanceof CComplexObjectTom) {
            return createComplexObjectConstraint((CComplexObjectTom)tom, (CComplexObject)parent);
        }

        switch (tom.getRmType()) {
            case "C_TERMINOLOGY_CODE":
                return createTerminologyCodeConstraint((CTerminologyCodeTom) tom, (CTerminologyCode) parent);
            case "C_REAL":
                return createRealConstraint((CRealTom) tom, (CReal) parent);
            case "C_INTEGER":
                return createIntegerConstraint((CIntegerTom) tom, (CInteger) parent);
            case "C_STRING":
                return createStringConstraint((CStringTom) tom, (CString) parent);
            case "C_DATE_TIME":
                return createDateTimeConstraint((CDateTimeTom) tom, (CDateTime) parent);
            case "C_DATE":
                return createDateConstraint((CDateTom) tom, (CDate) parent);
            case "C_TIME":
                return createTimeConstraint((CTimeTom) tom, (CTime) parent);
            case "C_BOOLEAN":
                return createBooleanConstraint((CBooleanTom) tom, (CBoolean) parent);
            case "C_DURATION":
                return createDurationConstraint((CDurationTom) tom, (CDuration) parent);
            default:
                throw new IllegalStateException("Unsupported rm constraint: " + tom.getRmType());
        }
    }

    private CComplexObject createComplexObjectConstraint(CComplexObjectTom tom, CComplexObject parent) {
        CComplexObject result = new CComplexObject();
        result.setRmTypeName(tom.getRmType());
        if (tom.getChildren()!=null) {
            for (ConstraintTom childTom : tom.getChildren()) {
                addConstraint(result, childTom, parent);
            }
        }
        if (result.getAttributes().isEmpty() && result.getAttributeTuples().isEmpty()) return null;

        return result;
    }

    private CDuration createDurationConstraint(CDurationTom tom, CDuration parent) {
        CDuration result = new CDuration();
        result.setRmTypeName(tom.getRmType());
        result.setPattern(tom.getPattern());
        result.setRange(tom.getRange());
        return result;
    }

    private CBoolean createBooleanConstraint(CBooleanTom tom, CBoolean parent) {
        CBoolean result = new CBoolean();
        result.setRmTypeName(tom.getRmType());
        result.setFalseValid(tom.isFalseValid());
        result.setTrueValid(tom.isTrueValid());
        return result;
    }

    private CDateTime createDateTimeConstraint(CDateTimeTom tom, CDateTime parent) {
        CDateTime result = new CDateTime();
        result.setPattern(tom.getPattern());
        result.setRmTypeName(tom.getRmType());
        result.setRange(tom.getRange());
        return result;
    }
    private CDate createDateConstraint(CDateTom tom, CDate parent) {
        CDate result = new CDate();
        result.setPattern(tom.getPattern());
        result.setRmTypeName(tom.getRmType());
        result.setRange(tom.getRange());
        return result;
    }
    private CTime createTimeConstraint(CTimeTom tom, CTime parent) {
        CTime result = new CTime();
        result.setPattern(tom.getPattern());
        result.setRmTypeName(tom.getRmType());
        result.setRange(tom.getRange());
        return result;
    }

    private CInteger createIntegerConstraint(CIntegerTom tom, CInteger parent) {
        CInteger result = new CInteger();
        result.setRmTypeName(tom.getRmType());
        result.setDefaultValue(tom.getDefaultValue());
        result.setRange(tom.getRange());
        if (tom.getList() != null) {
            result.getList().addAll(tom.getList());
        }
        return result;
    }

    private CString createStringConstraint(CStringTom tom, CString parent) {
        CString result = new CString();
        result.setRmTypeName(tom.getRmType());
        if (tom.getList() != null) {
            result.getList().addAll(tom.getList());
        }
        return result;
    }

    private CReal createRealConstraint(CRealTom tom, CReal parent) {
        CReal result = new CReal();
        result.setRmTypeName(tom.getRmType());
        result.setDefaultValue(tom.getDefaultValue());
        result.setRange(tom.getRange());
        if (tom.getList() != null) {
            result.getList().addAll(tom.getList());
        }
        return result;
    }


    private CTerminologyCode createTerminologyCodeConstraint(CTerminologyCodeTom tom, CTerminologyCode parent) {
        if (parent == null) return null;
        if (tom.getOriginal() == null) return null;
        if (tom.getCodeList().equals(tom.getOriginal().getCodeList())) return null;

        CTerminologyCode result = new CTerminologyCode();
        result.setRmTypeName(tom.getRmType());
        List<String> newCodeList = tom.getCodeList();


        boolean valueSetAdded = false;
        if (parent.getCodeList().size() == 1) {
            for (ValueSetItem valueSetItem : archetypeParent.getOntology().getValueSets()) {
                if (valueSetItem.getId().equals(parent.getCodeList().get(0))) {
                    String parentId = parent.getCodeList().get(0);
                    String newId = overrideNodeId(parentId);

                    ValueSetItem vsi = new ValueSetItem();
                    vsi.setId(newId);
                    vsi.getMembers().addAll(newCodeList);
                    archetype.getOntology().getValueSets().add(vsi);
                    valueSetAdded = true;
                    result.getCodeList().add(newId);
                    break;
                }
            }
        }
        if (!valueSetAdded) {
            result.getCodeList().addAll(newCodeList);
        }


        return result;
    }

}
