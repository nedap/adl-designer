package org.openehr.designer.io;

import com.google.common.base.Charsets;
import com.google.common.base.Splitter;
import com.google.common.io.CharStreams;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.adl.parser.BomSupportingReader;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.DifferentialArchetype;

import java.io.IOException;
import java.io.InputStream;
import java.io.Reader;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Pattern;

/**
 * @author Marko Pipan
 */
public class TemplateDeserializer {
    public static List<DifferentialArchetype> deserialize(RmModel rmModel, InputStream adltStream) throws IOException {
        try (Reader r = new BomSupportingReader(adltStream, Charsets.UTF_8)) {
            String adltContents = CharStreams.toString(r);
            return deserialize(rmModel, adltContents);
        }

    }

    public static List<DifferentialArchetype> deserialize(RmModel rmModel, String adltContent) {
        Iterable<String> adls = Splitter.on(Pattern.compile("(\r|\n)+ *\\-{2,} *(\r|\n)+")).split(adltContent);

        List<DifferentialArchetype> result = new ArrayList<>();
        AdlDeserializer deserializer = new AdlDeserializer(rmModel);
        for (String adl : adls) {
            result.add(deserializer.parse(adl));
        }
        return result;
    }
}
