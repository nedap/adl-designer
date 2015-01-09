package org.openehr.designer.tom.aom.parser;

import com.google.common.collect.Lists;
import org.openehr.designer.ArchetypeRepository;
import org.openehr.designer.ArchetypeRepositoryOverlay;
import org.openehr.designer.tom.*;
import org.openehr.designer.tom.constraint.*;
import org.openehr.adl.am.AmQuery;
import org.openehr.adl.rm.RmModel;
import org.openehr.adl.rm.RmType;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.jaxb.am.*;
import org.openehr.jaxb.rm.MultiplicityInterval;
import org.openehr.jaxb.rm.TranslationDetails;

import javax.annotation.Nullable;
import java.util.*;
import java.util.stream.Collectors;

import static com.google.common.base.MoreObjects.firstNonNull;

/**
 * @author Marko Pipan
 */
public class AomToTomParser {
    private final RmModel rmModel;
    private final ArchetypeRepository archetypeRepository;
    private final List<DifferentialArchetype> archetypes;

    public AomToTomParser(RmModel rmModel, ArchetypeRepository archetypeRepository, List<DifferentialArchetype> archetypes) {
        this.rmModel = rmModel;
        this.archetypeRepository = new ArchetypeRepositoryOverlay(archetypeRepository, archetypes);

        this.archetypes = archetypes;
    }

    public TemplateTom parse() {
        TemplateTom result = new TemplateTom();
        AomToTomContext context = new AomToTomContext();
        parseArchetype(result, context, archetypes.get(0));
        return result;
    }

    private void parseArchetype(ArchetypeRootTom target, AomToTomContext context, DifferentialArchetype overlayArchetype) {

        FlatArchetype parentArchetype = archetypeRepository.getFlatArchetype(overlayArchetype.getParentArchetypeId().getValue());
        FlatArchetype flatOverlayArchetype = archetypeRepository.getFlatArchetype(overlayArchetype.getArchetypeId().getValue());

        AomToTomContext.Node node = new AomToTomContext.Node();
        node.setPath("");
        node.setOverlayArchetype(new ArchetypeWrapper(overlayArchetype));
        node.setParentArchetype(new ArchetypeWrapper(parentArchetype));
        node.setFlatOverlayArchetype(new ArchetypeWrapper(flatOverlayArchetype));

        ArchetypeWrapper archetypeWrapper = new ArchetypeWrapper(overlayArchetype);

        target.setArchetypeId(overlayArchetype.getArchetypeId().getValue());
        target.setParentArchetypeId(overlayArchetype.getParentArchetypeId().getValue());
//        target.setNodeId(overlayArchetype.getConcept());
        target.setNodeId(parentNodeId(overlayArchetype.getDefinition().getNodeId()));
        target.setPath(node.getPath());
        target.setRmType(overlayArchetype.getDefinition().getRmTypeName());
        target.setTerms(buildTerms(archetypeWrapper, overlayArchetype.getDefinition().getNodeId()));

        context.push(node);
        addCComplexObjectChildren(target, context, overlayArchetype.getDefinition());
        context.pop();
    }

    private void addCComplexObjectChildren(AbstractItemTom target, AomToTomContext context, CComplexObject container) {
        target.setItems(new ArrayList<>());
        for (CAttribute attribute : container.getAttributes()) {
            String path = attribute.getDifferentialPath() != null ? attribute.getDifferentialPath() : attribute.getRmAttributeName();

            for (CObject cObject : attribute.getChildren()) {
                AomToTomContext.Node childNode = new AomToTomContext.Node(context.node());
                childNode.setPath(path);
                childNode.setPathFromArchetypeRoot(
                        firstNonNull(childNode.getPathFromArchetypeRoot(), "") + makeParentPath(path, cObject.getNodeId()));
                context.push(childNode);
                target.getItems().add(parseItem(cObject, context));
                context.pop();
            }
        }
    }

    private AbstractItemTom parseItem(CObject cobj, AomToTomContext context) {
        if (cobj instanceof CArchetypeRoot) {
            return parseArchetypeRoot((CArchetypeRoot) cobj, context);
        } else if (cobj instanceof CComplexObject) {
            return parseCObject(cobj, context);
        }
        throw new AssertionError(cobj.getClass().getName());
    }

    private ItemTom parseCObject(CObject cobj, AomToTomContext context) {
        AomToTomContext.Node node = context.node();

        ItemTom result = new ItemTom();
        result.setOccurrences(parseOccurrencesTom(cobj.getOccurrences()));
        result.setNodeId(parentNodeId(cobj.getNodeId()));
        result.setRmType(cobj.getRmTypeName());
        result.setPath(node.getPath());
        result.setTerms(buildTerms(node.getOverlayArchetype(), cobj.getNodeId()));

        RmType rmType = rmModel.getRmType(cobj.getRmTypeName());
        if (rmType.isFinalType()) {
            final CObject dataCObj, parentDataCObj, flatOverlayDataCObj;
            CObject parentCObj = AmQuery.get(node.getParentArchetype().getArchetype(), node.getPathFromArchetypeRoot());
            CObject flatOverlayCObj = AmQuery.get(node.getFlatOverlayArchetype().getArchetype(), node.getPathFromArchetypeRoot());

            if (rmType.getDataAttribute() != null) {
                dataCObj = AmQuery.get(cobj, rmType.getDataAttribute());
                parentDataCObj = AmQuery.get(parentCObj, rmType.getDataAttribute());
                flatOverlayDataCObj = AmQuery.get(flatOverlayCObj, rmType.getDataAttribute());
                result.setDataAttribute(rmType.getDataAttribute());
            } else {
                dataCObj = cobj;
                parentDataCObj = parentCObj;
                flatOverlayDataCObj = flatOverlayCObj;
            }

            result.setConstraints(parseConstraint(context, dataCObj, parentDataCObj, flatOverlayDataCObj));
            result.getConstraints().setAttribute(rmType.getDataAttribute());
        } else if (cobj instanceof CComplexObject) {
            addCComplexObjectChildren(result, context, (CComplexObject) cobj);
        }

        return result;
    }

    @Nullable
    private OccurrencesTom parseOccurrencesTom(@Nullable MultiplicityInterval occurrences) {
        if (occurrences == null) return null;
        return new OccurrencesTom(occurrences.getLower(), occurrences.getUpper());
    }

    private String parentNodeId(String nodeId) {
        if (nodeId == null) return null;
        int cp = nodeId.lastIndexOf('.');
        if (cp < 0) return nodeId;
        return nodeId.substring(0, cp);
    }

    private String makeParentPath(String basePath, String nodeId) {
        if (nodeId == null) {
            return basePath;
        }
        return basePath + "[" + parentNodeId(nodeId) + "]";
    }

    private ConstraintTom parseConstraint(AomToTomContext context, CObject cobj, CObject parentCObj, CObject flatOverlayCObj) {
        if (cobj instanceof CComplexObject) {
            return pareComplexObjectConstraint(context, (CComplexObject) cobj, (CComplexObject) parentCObj,
                    (CComplexObject) flatOverlayCObj);
        }
        if (cobj instanceof CTerminologyCode) {
            return parseTerminologyCodeConstraint(context, (CTerminologyCode) cobj, (CTerminologyCode) parentCObj);
        }
        if (cobj instanceof CString) {
            return parseStringConstraint(context, (CString) cobj, (CString) parentCObj);
        }
        if (cobj instanceof CInteger) {
            return parseIntegerConstraint(context, (CInteger) cobj, (CInteger) parentCObj);
        }
        if (cobj instanceof CReal) {
            return parseRealConstraint(context, (CReal) cobj, (CReal) parentCObj);
        }
        if (cobj instanceof CDateTime) {
            return parseDateTimeConstraint(context, (CDateTime) cobj, (CDateTime) parentCObj);
        }
        if (cobj instanceof CDate) {
            return parseDateConstraint(context, (CDate) cobj, (CDate) parentCObj);
        }
        if (cobj instanceof CTime) {
            return parseTimeConstraint(context, (CTime) cobj, (CTime) parentCObj);
        }
        if (cobj instanceof CDuration) {
            return parseDurationConstraint(context, (CDuration) cobj, (CDuration) parentCObj);
        }
        if (cobj instanceof CBoolean) {
            return parseBooleanConstraint(context, (CBoolean) cobj, (CBoolean) parentCObj);
        }

        throw new AssertionError(cobj.getClass().getName());
    }

    private CBooleanTom parseBooleanConstraint(AomToTomContext context, CBoolean cobj, CBoolean parentCObj) {
        if (cobj==null) return null;
        CBooleanTom result = new CBooleanTom();
        result.setRmType(cobj.getRmTypeName());
        result.setFalseValid(cobj.isFalseValid());
        result.setTrueValid(cobj.isTrueValid());
        result.setOriginal(parseBooleanConstraint(context, parentCObj, null));
        return result;
    }

    private CDurationTom parseDurationConstraint(AomToTomContext context, CDuration cobj, CDuration parentCObj) {
        if (cobj==null) return null;
        CDurationTom result = new CDurationTom();
        result.setRmType(cobj.getRmTypeName());
        result.setRange(cobj.getRange());
        result.setPattern(cobj.getPattern());
        result.setOriginal(parseDurationConstraint(context, parentCObj, null));
        return result;
    }

    private CDateTimeTom parseDateTimeConstraint(AomToTomContext context, CDateTime cobj, CDateTime parentCObj) {
        if (cobj == null) return null;
        CDateTimeTom result = new CDateTimeTom();
        result.setRmType(cobj.getRmTypeName());
        result.setRange(cobj.getRange());
        result.setPattern(cobj.getPattern());
        result.setOriginal(parseDateTimeConstraint(context, parentCObj, null));

        return result;
    }

    private CDateTom parseDateConstraint(AomToTomContext context, CDate cobj, CDate parentCObj) {
        if (cobj == null) return null;
        CDateTom result = new CDateTom();
        result.setRmType(cobj.getRmTypeName());
        result.setRange(cobj.getRange());
        result.setPattern(cobj.getPattern());
        result.setOriginal(parseDateConstraint(context, parentCObj, null));

        return result;
    }

    private CTimeTom parseTimeConstraint(AomToTomContext context, CTime cobj, CTime parentCObj) {
        if (cobj == null) return null;
        CTimeTom result = new CTimeTom();
        result.setRmType(cobj.getRmTypeName());
        result.setRange(cobj.getRange());
        result.setPattern(cobj.getPattern());
        result.setOriginal(parseTimeConstraint(context, parentCObj, null));

        return result;
    }

    private CRealTom parseRealConstraint(AomToTomContext context, CReal cobj, CReal parentCObj) {
        if (cobj == null) return null;

        CRealTom result = new CRealTom();
        result.setRmType(cobj.getRmTypeName());
        result.setList(cobj.getList().isEmpty() ? null : cobj.getList());
        result.setRange(cobj.getRange());
        result.setDefaultValue(cobj.getDefaultValue());
        result.setOriginal(parseRealConstraint(context, parentCObj, null));

        return result;
    }


    private CIntegerTom parseIntegerConstraint(AomToTomContext context, CInteger cobj, CInteger parentCObj) {
        if (cobj == null) return null;

        CIntegerTom result = new CIntegerTom();
        result.setRmType(cobj.getRmTypeName());
        result.setList(cobj.getList().isEmpty() ? null : cobj.getList());
        result.setRange(cobj.getRange());
        result.setDefaultValue(cobj.getDefaultValue());
        result.setOriginal(parseIntegerConstraint(context, parentCObj, null));
        return result;
    }


    private CStringTom parseStringConstraint(AomToTomContext context, CString cobj, CString parentCObj) {
        if (cobj == null) return null;
        CStringTom result = new CStringTom();
        result.setRmType(cobj.getRmTypeName());
        result.setList(cobj.getList());
        result.setOriginal(parseStringConstraint(context, parentCObj, null));

        return result;
    }

    private CTerminologyCodeTom parseTerminologyCodeConstraint(AomToTomContext context, CTerminologyCode cobj,
            CTerminologyCode parentCObj) {
        if (cobj == null) return null;

        CTerminologyCodeTom result = parseTerminologyCodeConstraint(context.node().getOverlayArchetype(), cobj);
        if (result != null) {
            result.setOriginal(parseTerminologyCodeConstraint(context.node().getParentArchetype(), parentCObj));
        }

        return result;
    }

    private CTerminologyCodeTom parseTerminologyCodeConstraint(ArchetypeWrapper archetype, CTerminologyCode cobj) {
        CTerminologyCodeTom result = new CTerminologyCodeTom();
        result.setRmType(cobj.getRmTypeName());

        Set<String> codes = explodeCodes(archetype, cobj.getCodeList());
        result.setCodeList(Lists.newArrayList(codes));
        return result;
    }

    public static Set<String> explodeCodes(ArchetypeWrapper archetype, List<String> codeList) {
        Set<String> result = new LinkedHashSet<>();
        for (String code : codeList) {
            List<String> valueSet = archetype.getValueSet(code);
            if (valueSet != null) {
                result.addAll(valueSet);
            } else {
                result.add(code);
            }
        }
        return result;
    }

    private CComplexObjectTom pareComplexObjectConstraint(AomToTomContext context, CComplexObject cobj, CComplexObject parentCObj,
            CComplexObject flatOverlayCObj) {
        CComplexObjectTom result = new CComplexObjectTom();
        result.setRmType(cobj.getRmTypeName());
        result.setChildren(new ArrayList<>());
        Set<String> attributes = new LinkedHashSet<>();
        for (CAttribute attribute : cobj.getAttributes()) {
            attributes.add(attribute.getRmAttributeName());
            for (CObject cObject : attribute.getChildren()) {
                final CObject childParentConstraint = AmQuery.find(parentCObj,
                        makeParentPath(attribute.getRmAttributeName(), cObject.getNodeId()));
                final CObject flatOverlayConstraint = AmQuery.get(flatOverlayCObj,
                        makeParentPath(attribute.getRmAttributeName(), cObject.getNodeId()));
                ConstraintTom constraint = parseConstraint(context, cObject, childParentConstraint, flatOverlayConstraint);
                constraint.setAttribute(attribute.getRmAttributeName());
                result.getChildren().add(constraint);
            }
        }

        for (CAttribute attribute : parentCObj.getAttributes()) {
            if (attributes.contains(attribute.getRmAttributeName())) continue;
            attributes.add(attribute.getRmAttributeName());
        }

        for (CAttributeTuple parentAttributeTuple : parentCObj.getAttributeTuples()) {
            CAttributeTuple specializedAttributeTuple = findAttributeTuple(cobj, parentAttributeTuple.getMembers()).orElse(null);
//            CAttributeTuple parentAttributeTuple = getAttributeTuple(parentCObj, cAttributeTuple.getMembers());

            TupleConstraintTom tupleConstraintTom = new TupleConstraintTom();
            tupleConstraintTom.setHasParent(parentCObj!=null);
            tupleConstraintTom.setMembers(
                    parentAttributeTuple.getMembers().stream().map(CAttribute::getRmAttributeName).collect(Collectors.toList()));
            tupleConstraintTom.setChildren(new ArrayList<>());

            for (CObjectTuple parentCObjectTuple : parentAttributeTuple.getChildren()) {
                CObjectTuple specializedCObjectTuple = findMatchingObjectTupleOrNull(specializedAttributeTuple, parentCObjectTuple);

                ObjectTupleConstraintTom objectTupleConstraintTom = new ObjectTupleConstraintTom();
                objectTupleConstraintTom.setPresent(specializedCObjectTuple != null);
                objectTupleConstraintTom.setMembers(new ArrayList<>());

                for (int i = 0; i < parentCObjectTuple.getMembers().size(); i++) {
                    String attributeName = parentAttributeTuple.getMembers().get(i).getRmAttributeName();
                    CPrimitiveObject cParentPrimitiveObject = parentCObjectTuple.getMembers().get(i);
                    CPrimitiveObject cSpecializedPrimitiveObject =
                            specializedCObjectTuple != null ? specializedCObjectTuple.getMembers().get(i) : null;

                    final ConstraintTom childConstraint;
                    if (cSpecializedPrimitiveObject != null) {
                        childConstraint = parseConstraint(context, cSpecializedPrimitiveObject, cParentPrimitiveObject, null);
                    } else {
                        childConstraint = parseConstraint(context, cParentPrimitiveObject, cParentPrimitiveObject, null);
                    }
                    childConstraint.setAttribute(attributeName);
                    objectTupleConstraintTom.getMembers().add(childConstraint);

                }
                tupleConstraintTom.getChildren().add(objectTupleConstraintTom);

            }
            result.getChildren().add(tupleConstraintTom);
        }
        return result;
    }

    private CObjectTuple findMatchingObjectTupleOrNull(CAttributeTuple parentAttributeTuple, CObjectTuple cObjectTuple) {
        if (parentAttributeTuple == null) return null;
        for (CObjectTuple parentObjectTuple : parentAttributeTuple.getChildren()) {

            for (int i = 0; i < cObjectTuple.getMembers().size(); i++) {
                CPrimitiveObject cobj = cObjectTuple.getMembers().get(i);
                CPrimitiveObject parentCObj = parentObjectTuple.getMembers().get(i);
                if (primitiveConstraintMatches(cobj, parentCObj)) {
                    return parentObjectTuple;
                }
            }
        }
        return null;
    }

    private boolean primitiveConstraintMatches(CPrimitiveObject cobj, CPrimitiveObject parentCObj) {
        if (cobj instanceof CString) {
            CString c = (CString) cobj;
            CString p = (CString) parentCObj;
            if (!p.getList().containsAll(c.getList())) {
                return false;
            }
            return true;
        }
        return false;
    }

    private Optional<CAttributeTuple> findAttributeTuple(CComplexObject parentCObj, List<CAttribute> members) {
        search:
        for (CAttributeTuple cAttributeTuple : parentCObj.getAttributeTuples()) {
            List<CAttribute> members1 = cAttributeTuple.getMembers();
            if (members1.size() != members.size()) continue search;
            for (int i = 0; i < members1.size(); i++) {
                CAttribute cAttribute = members1.get(i);
                if (!cAttribute.getRmAttributeName().equals(members.get(i).getRmAttributeName())) {
                    continue search;
                }
            }
            return Optional.of(cAttributeTuple);
        }
        return Optional.empty();
    }

    private CAttributeTuple getAttributeTuple(CComplexObject parentCObj, List<CAttribute> members) {
        return findAttributeTuple(parentCObj, members).orElseThrow(() -> new AssertionError("No matching parent attribute tuple"));
    }

    private ArchetypeTom parseArchetypeRoot(CArchetypeRoot cobj, AomToTomContext context) {
        DifferentialArchetype differentialArchetype = findOverlayArchetype(cobj.getArchetypeRef());
        ArchetypeTom result = new ArchetypeTom();
        parseArchetype(result, context, differentialArchetype);
        String path = context.node().getPath();
        result.setPath(path);

        return result;
    }

    private DifferentialArchetype findOverlayArchetype(String archetypeId) {
        for (DifferentialArchetype archetype : archetypes) {
            if (archetype.getArchetypeId().getValue().equals(archetypeId)) {
                return archetype;
            }
        }
        throw new AssertionError(archetypeId);
    }

    private Map<String, LocalizedNameTom> buildTerms(ArchetypeWrapper archetypeWrapper, String nodeId) {
        if (nodeId == null) return null;

        String originalLanguage = archetypeWrapper.getArchetype().getOriginalLanguage().getCodeString();
        Map<String, String> terms = archetypeWrapper.getTerm(originalLanguage, nodeId);
        if (terms == null) {
            return null;
        }
        Map<String, LocalizedNameTom> result = new LinkedHashMap<>();
        result.put(originalLanguage, new LocalizedNameTom(terms.get("text"), terms.get("description")));
        for (TranslationDetails translationDetails : archetypeWrapper.getArchetype().getTranslations()) {
            String translation = translationDetails.getLanguage().getCodeString();
            terms = archetypeWrapper.getTerm(translation, nodeId);
            if (terms == null) continue;
            result.put(translation, new LocalizedNameTom(terms.get("text"), terms.get("description")));
        }
        return result;
    }


}
