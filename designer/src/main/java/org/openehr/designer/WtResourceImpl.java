package org.openehr.designer;

import org.openehr.designer.io.opt.OptBuilder;
import org.openehr.designer.repository.TemplateInfo;
import org.openehr.designer.repository.TemplateRepository;
import org.openehr.designer.tom.TemplateTom;
import org.openehr.designer.tom.aom.builder.TomTemplateBuilder;
import org.openehr.designer.tom.aom.parser.AomToTomParser;
import org.openehr.adl.rm.RmModel;
import org.openehr.adl.rm.RmType;
import org.openehr.adl.rm.RmTypeAttribute;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.LinkedHashMap;
import java.util.List;

/**
 * @author Marko Pipan
 */
@RestController
@RequestMapping(value = "/repo")
public class WtResourceImpl implements WtResource {
    private static final Logger LOG = LoggerFactory.getLogger(WtResourceImpl.class);

    @Resource
    private ArchetypeRepository archetypeRepository;
    @Resource
    private TemplateRepository templateRepository;
    @Resource
    private RmModel rmModel;
    @Resource
    private OptBuilder optBuilder;

    @RequestMapping(value = "/archetype/{archetypeId}/source")
    @Override
    public DifferentialArchetype getSourceArchetype(@PathVariable("archetypeId") String archetypeId) {

        return archetypeRepository.getDifferentialArchetype(archetypeId);
    }

    @RequestMapping(value = "/archetype/{archetypeId}/flat")
    @Override
    public FlatArchetype getFlatArchetype(@PathVariable("archetypeId") String archetypeId) {
        return archetypeRepository.getFlatArchetype(archetypeId);
    }

    @RequestMapping(value = "/list")
    @Override
    public List<ArchetypeInfo> listArchetypeInfos() {
        return archetypeRepository.getArchetypeInfos();
    }


    @RequestMapping(value = "/rm/{modelName}/{modelVersion}")
    @Override
    public ReferenceModelData getRmModel(@PathVariable("modelName") String modelName, @PathVariable("modelVersion") String modelVersion) {
        List<RmType> types = archetypeRepository.getRmModel().getAllTypes();

        ReferenceModelData result = new ReferenceModelData();
        result.setName("openEHR");
        result.setVersion("1.0.2");
        result.setTypes(new LinkedHashMap<>());
        for (RmType type : types) {
            ReferenceModelData.Type t = new ReferenceModelData.Type();
            t.setName(type.getRmType());
            t.setParent(type.getParent() != null ? type.getParent().getRmType() : null);
            t.setFinalType(type.isFinalType());
            t.setDataAttribute(type.getDataAttribute());
            if (!type.getAttributes().isEmpty()) {
                t.setAttributes(new LinkedHashMap<>());
                for (RmTypeAttribute attribute : type.getAttributes().values()) {
                    ReferenceModelData.Attribute a = new ReferenceModelData.Attribute();
                    a.setName(attribute.getAttributeName());
                    a.setExistence(attribute.getExistence());
                    a.setType(attribute.getTargetType() != null ? attribute.getTargetType().getRmType() : null);
                    t.getAttributes().put(a.getName(), a);
                }
            }
            result.getTypes().put(t.getName(), t);
        }
        return result;
    }

    @RequestMapping(value = "/tom", method = RequestMethod.POST)
    @Override
    public void saveTom(@RequestBody TemplateTom templateTom) {
        LOG.info("TOM: {}", templateTom);
        List<DifferentialArchetype> templateArchetypes = new TomTemplateBuilder(archetypeRepository).build(templateTom);
        templateRepository.saveTemplate(templateArchetypes);
    }

    @RequestMapping(value = "/tom/{templateId}", method = RequestMethod.GET)
    @Override
    public TemplateTom loadTom(@PathVariable String templateId) {
        List<DifferentialArchetype> templateArchetypes = templateRepository.loadTemplate(templateId);
        TemplateTom templateTom = new AomToTomParser(rmModel, archetypeRepository, templateArchetypes).parse();
        return templateTom;
    }

    @RequestMapping(value="/tom", method = RequestMethod.GET)
    @Override
    public List<TemplateInfo> listToms() {
        return templateRepository.listTemplates();
    }

    @RequestMapping(value="/export/opt/14/{templateId}", method = RequestMethod.GET)
    @Override
    public ResponseEntity<byte[]> exportOpt14(@PathVariable String templateId) {
        List<DifferentialArchetype> templateArchetypes = templateRepository.loadTemplate(templateId);

        OptBuilder.Opt opt = optBuilder.build(templateArchetypes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/xml; charset=utf-8");
        headers.add("Content-Disposition", "attachment; filename=\"" + opt.getTemplateId() + ".opt\"");
        headers.add("Content-Length", Integer.toString(opt.getContent().length));
        return new ResponseEntity<>(opt.getContent(), headers, HttpStatus.OK);
    }
}
