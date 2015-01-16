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
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.util.Map;

import static org.fest.assertions.Assertions.assertThat;



/**
 * Created by Bjørn on 16/01/2015.
 */
public class FlattenParentWithChoicheElementTestCase extends  ArchetypeTestUtil{


    private final String clusterAmount = "repository/openEHR-EHR-CLUSTER.amount.v1.adl";
    private final String clusterAmountRange = "repository/openEHR-EHR-CLUSTER.amount-range.v1.adl";
    @Test
    public void testFlattenClusterAmountRangeWithClusterAmount() throws IOException {
        DifferentialArchetype parent = getDeserializer().parse(readArchetype(clusterAmount));
        DifferentialArchetype child = getDeserializer().parse(readArchetype(clusterAmountRange));
       FlatArchetype flat =  getFlattener().flatten(null, parent);
        assertThat(flat).isNotNull();
        FlatArchetype flatChild = getFlattener().flatten(flat, child);
        assertThat(flatChild).isNotNull();

    }

}
