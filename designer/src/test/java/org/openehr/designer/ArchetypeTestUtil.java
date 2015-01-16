package org.openehr.designer;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.module.jaxb.JaxbAnnotationModule;
import com.google.common.base.Charsets;
import com.google.common.io.CharStreams;
import org.openehr.adl.flattener.ArchetypeFlattener;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.designer.json.AmMixinModule;
import org.testng.annotations.BeforeClass;

import java.io.IOException;

/**
 * Created by Bjørn on 16/01/2015.
 */
public abstract class ArchetypeTestUtil {



    private ObjectMapper objectMapper;
    private AdlDeserializer deserializer;
    private ArchetypeFlattener flattener;
    @BeforeClass
    public void init(){
        objectMapper = new ObjectMapper();

        JaxbAnnotationModule jaxbModule = new JaxbAnnotationModule();
        objectMapper.registerModule(jaxbModule);
        objectMapper.registerModule(new AmMixinModule());
        final OpenEhrRmModel rmModel = new OpenEhrRmModel();
        deserializer = new AdlDeserializer(rmModel);
        flattener = new ArchetypeFlattener(rmModel);
    }

    protected String readArchetype(String file) throws IOException {
        return CharStreams.toString(new BomSupportingReader(
                getClass().getClassLoader().getResourceAsStream(file),
                Charsets.UTF_8));
    }

    public ArchetypeFlattener getFlattener() {
        return flattener;
    }

    public AdlDeserializer getDeserializer() {
        return deserializer;
    }
}
