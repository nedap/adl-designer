package org.openehr.designer.io;

import com.google.common.base.Joiner;
import org.openehr.adl.serializer.ArchetypeSerializer;
import org.openehr.jaxb.am.DifferentialArchetype;

import java.util.ArrayList;
import java.util.List;

/**
 * @author Marko Pipan
 */
public class TemplateSerializer {
    public static String serialize(List<DifferentialArchetype> archetypes) {
        List<String> serializedArchetypes = new ArrayList<>();
        for (DifferentialArchetype archetype : archetypes) {
            serializedArchetypes.add(ArchetypeSerializer.serialize(archetype));
        }

        return Joiner.on("\n---------------------------------------------------------------------------------\n").join(serializedArchetypes);
    }
}
