package org.openehr.designer.io;

import com.google.common.base.Charsets;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.adl.rm.OpenEhrRmModel;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.testng.annotations.Test;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;

public class TemplateDeserializerTestManual {

    @Test
    public void testDeserialize() throws Exception {

        String templateAdlt = new String(Files.readAllBytes(Paths.get("c:/temp/template.adlt")), Charsets.UTF_8);

        List<DifferentialArchetype> archetypes = TemplateDeserializer.deserialize(new OpenEhrRmModel(), templateAdlt);
    }
}