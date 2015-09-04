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

package org.openehr.designer.web;

import com.google.common.base.Charsets;
import org.openehr.adl.FlatArchetypeProvider;
import org.openehr.adl.rm.RmModel;
import org.openehr.adl.rm.RmType;
import org.openehr.adl.serializer.ArchetypeSerializer;
import org.openehr.adl.util.ArchetypeWrapper;
import org.openehr.designer.ArchetypeInfo;
import org.openehr.designer.FlatArchetypeProviderOverlay;
import org.openehr.designer.ReferenceModelData;
import org.openehr.designer.ReferenceModelDataBuilder;
import org.openehr.designer.diff.ArchetypeDifferentiator;
import org.openehr.designer.diff.TemplateDifferentiator;
import org.openehr.designer.io.TemplateSerializer;
import org.openehr.designer.io.opt.OptBuilder;
import org.openehr.designer.repository.*;
import org.openehr.designer.rm.ReferenceModels;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

/**
 * @author Marko Pipan
 */
@RestController
@RequestMapping(value = "/repo")
public class RepositoryResourceImpl implements RepositoryResource {
    private static final Logger LOG = LoggerFactory.getLogger(RepositoryResourceImpl.class);

    @Resource
    private ArchetypeRepository archetypeRepository;

    @Resource
    private TemplateRepository templateRepository;
    @Resource
    private ReferenceModels referenceModels;

    @Resource
    private OptBuilder optBuilder;

    private FlatArchetypeRepository flatArchetypeRepository;


    @PostConstruct
    public void init() {
        this.flatArchetypeRepository = new FlatArchetypeRepository(archetypeRepository, referenceModels.getDefaultReferenceModel());
    }

    @RequestMapping(value = "/archetype/{archetypeId}/source")
    @Override
    public DifferentialArchetype getSourceArchetype(@PathVariable("archetypeId") String archetypeId) {

        return archetypeRepository.getDifferentialArchetype(archetypeId);
    }

    @RequestMapping(value = "/archetype/{archetypeId}/flat", method = RequestMethod.GET)
    @Override
    public FlatArchetype getFlatArchetype(@PathVariable("archetypeId") String archetypeId) {
        return flatArchetypeRepository.getFlatArchetype(archetypeId);
    }

    @RequestMapping(value = "/archetype/{archetypeId}/flat", method = RequestMethod.PUT)
    @Override
    public void saveFlatArchetype(@PathVariable("archetypeId") String archetypeId, @RequestBody FlatArchetype archetype) {
        if (!archetypeId.equals(archetype.getArchetypeId().getValue())) {
            throw new IllegalArgumentException("Archetype id in path does not match archetype id in body");
        }

        DifferentialArchetype differentialArchetype = ArchetypeDifferentiator.differentiate(
                referenceModels.getDefaultReferenceModel(), flatArchetypeRepository, archetype);
        differentialArchetype.setRmRelease(ReferenceModelDataBuilder.RM_VERSION);
        archetypeRepository.saveDifferentialArchetype(differentialArchetype);
    }

    @RequestMapping(value = "/list")
    @Override
    public List<ArchetypeInfo> listArchetypeInfos() {
        return archetypeRepository.getArchetypeInfos();
    }


//    @RequestMapping(value = "/rm/{modelName}/{modelVersion}")
//    @Override
//    public ReferenceModelData getRmModel(@PathVariable("modelName") String modelName, @PathVariable("modelVersion") String modelVersion) throws IOException {
//
//        ReferenceModelDataBuilder builder = new ReferenceModelDataBuilder();
//        return builder.build(referenceModels.getDefaultReferenceModel());
//    }

    @RequestMapping(value = "/template", method = RequestMethod.POST)
    @Override
    public void saveTemplate(@RequestBody List<FlatArchetype> archetypes) {
        TemplateDifferentiator differentiator = new TemplateDifferentiator(flatArchetypeRepository);
        List<DifferentialArchetype> sourceArchetypes = differentiator.differentiate(referenceModels.getDefaultReferenceModel(), archetypes);
        sourceArchetypes.forEach(a -> {
            if (a.getRmRelease() == null) {
                a.setRmRelease(ReferenceModelDataBuilder.RM_VERSION);
            }
        });
        templateRepository.saveTemplate(sourceArchetypes);
    }

    @RequestMapping(value = "/template", method = RequestMethod.GET)
    @Override
    public List<TemplateInfo> listTemplates() {
        return templateRepository.listTemplates();
    }

    @RequestMapping(value = "/template/{templateId}", method = RequestMethod.GET)
    @Override
    public List<FlatArchetype> loadTemplate(@PathVariable String templateId) {
        List<DifferentialArchetype> differentials = templateRepository.loadTemplate(templateId);
        FlatArchetypeProvider flatArchetypeProvider = new FlatArchetypeProviderOverlay(flatArchetypeRepository,
                referenceModels.getDefaultReferenceModel(), differentials);

        List<FlatArchetype> result = new ArrayList<>();
        for (DifferentialArchetype differential : differentials) {
            result.add(flatArchetypeProvider.getFlatArchetype(differential.getArchetypeId().getValue()));
        }

        return result;
    }

    @RequestMapping(value = "/export/opt/14/{templateId}", method = RequestMethod.GET)
    @Override
    public ResponseEntity<byte[]> exportSavedOpt14(@PathVariable String templateId) {
        List<DifferentialArchetype> templateArchetypes = templateRepository.loadTemplate(templateId);

        OptBuilder.Opt opt = optBuilder.build(templateArchetypes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/xml; charset=utf-8");
        headers.add("Content-Disposition", "attachment; filename=\"" + opt.getTemplateId() + ".opt\"");
        headers.add("Content-Length", Integer.toString(opt.getContent().length));
        return new ResponseEntity<>(opt.getContent(), headers, HttpStatus.OK);
    }


    @RequestMapping(value = "/export/opt/14", method = RequestMethod.POST)
    @Override
    public ResponseEntity<byte[]> exportProvidedOpt14(@RequestBody List<FlatArchetype> flatArchetypeList) {
        TemplateDifferentiator differentiator = new TemplateDifferentiator(flatArchetypeRepository);
        List<DifferentialArchetype> templateArchetypes = differentiator.differentiate(
                referenceModels.getDefaultReferenceModel(), flatArchetypeList);

        OptBuilder.Opt opt = optBuilder.build(templateArchetypes);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/xml; charset=utf-8");
        headers.add("Content-Disposition", "attachment; filename=\"" + opt.getTemplateId() + ".opt\"");
        headers.add("Content-Length", Integer.toString(opt.getContent().length));
        return new ResponseEntity<>(opt.getContent(), headers, HttpStatus.OK);
    }

    @RequestMapping(value = "/export/adlt/{templateId}", method = RequestMethod.GET)
    @Override
    public ResponseEntity<byte[]> exportAdlt(@PathVariable String templateId) {
        List<DifferentialArchetype> archetypes = templateRepository.loadTemplate(templateId);
        DifferentialArchetype archetype = archetypes.get(0);
        ArchetypeWrapper archetypeWrapper = new ArchetypeWrapper(archetype);
        String archetypeName = archetypeWrapper.getTermText(archetype.getDefinition().getNodeId());

        byte[] adltContent = TemplateSerializer.serialize(archetypes).getBytes(Charsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "text/plain; charset=utf-8");
        headers.add("Content-Disposition", "attachment; filename=\"" + archetypeName + ".adlt\"");
        headers.add("Content-Length", Integer.toString(adltContent.length));
        return new ResponseEntity<>(adltContent, headers, HttpStatus.OK);
    }

    @RequestMapping(value = "/display/adl/source", method = RequestMethod.POST, produces = "text/plain; charset=utf-8")
    @ResponseBody
    @Override
    public String displayArchetypeAdlSource(@RequestBody FlatArchetype archetype) {
//        FlatArchetype parentArchetype = null;
//        if (archetype.getParentArchetypeId() != null && archetype.getParentArchetypeId().getValue() != null) {
//            parentArchetype = flatArchetypeRepository.getFlatArchetype(archetype.getParentArchetypeId().getValue());
//        }

        DifferentialArchetype differentialArchetype = ArchetypeDifferentiator.differentiate(
                referenceModels.getDefaultReferenceModel(), flatArchetypeRepository, archetype);
        return ArchetypeSerializer.serialize(differentialArchetype);
    }

    @RequestMapping(value = "/display/adl/flat", method = RequestMethod.POST, produces = "text/plain; charset=utf-8")
    @ResponseBody
    @Override
    public String displayArchetypeAdlFlat(@RequestBody FlatArchetype archetype) {
        return ArchetypeSerializer.serialize(archetype);
    }

    @RequestMapping(value = "/display/adl/template", method = RequestMethod.POST, produces = "text/plain; charset=utf-8")
    @ResponseBody
    @Override
    public String displayTemplateAdl(@RequestBody List<FlatArchetype> flatArchetypeList) {
        TemplateDifferentiator differentiator = new TemplateDifferentiator(flatArchetypeRepository);
        List<DifferentialArchetype> sourceArchetypes = differentiator.differentiate(
                referenceModels.getDefaultReferenceModel(), flatArchetypeList);
        return TemplateSerializer.serialize(sourceArchetypes);
    }

    @RequestMapping(value = "/commit", method = RequestMethod.POST, produces = "text/plain; charset=utf-8")
    @Override
    public void commit(@RequestBody CommitRequest commitRequest) {
        if (archetypeRepository instanceof ScmEnabled) {
            ScmEnabled scm = (ScmEnabled) archetypeRepository;
            scm.commit(commitRequest.getMessage());
        } else {
            throw new RuntimeException("Repository does not support commit");
        }
    }

    @ResponseStatus(value = HttpStatus.BAD_REQUEST, reason = "No such archetype")
    @ExceptionHandler(ArchetypeNotFoundException.class)
    @ResponseBody
    public ErrorResponse handleArchetypeNotFoundException(ArchetypeNotFoundException e) {
        LOG.error("Bad Request", e);
        return new ErrorResponse(e.getMessage());
    }

    @ResponseStatus(value = HttpStatus.INTERNAL_SERVER_ERROR)
    @ExceptionHandler(Exception.class)
    @ResponseBody
    public ErrorResponse handleException(Exception e) {
        LOG.error("Internal server error", e);
        return new ErrorResponse(e.getMessage());
    }

    @ResponseStatus(value = HttpStatus.NOT_IMPLEMENTED)
    @ExceptionHandler(UnsupportedOperationException.class)
    @ResponseBody
    public ErrorResponse handleException(UnsupportedOperationException e) {
        LOG.error("Unsupported operation", e);
        return new ErrorResponse(e.getMessage());
    }

}
