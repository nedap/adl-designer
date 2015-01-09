package org.openehr.designer;

import org.openehr.adl.flattener.ArchetypeFlattener;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * @author Marko Pipan
 */
public class ArchetypeRepositoryOverlay implements ArchetypeRepository {
    private final ArchetypeRepository delegate;
    private final Map<String, DifferentialArchetype> overlayArchetypeMap;
    private final ArchetypeFlattener flattener;


    public ArchetypeRepositoryOverlay(ArchetypeRepository delegate, List<DifferentialArchetype> archetypes) {
        this.delegate = delegate;
        flattener = new ArchetypeFlattener(delegate.getRmModel());

        overlayArchetypeMap = new LinkedHashMap<>();
        for (DifferentialArchetype archetype : archetypes) {
            overlayArchetypeMap.put(archetype.getArchetypeId().getValue(), archetype);
        }
    }

    @Override
    public RmModel getRmModel() {
        return delegate.getRmModel();
    }

    @Override
    public DifferentialArchetype getDifferentialArchetype(String archetypeId) {
        DifferentialArchetype archetype = overlayArchetypeMap.get(archetypeId);
        if (archetype!=null) return archetype;
        return delegate.getDifferentialArchetype(archetypeId);
    }

    @Override
    public FlatArchetype getFlatArchetype(String archetypeId) {
        DifferentialArchetype source = getDifferentialArchetype(archetypeId);
        FlatArchetype parent = null;
        if (source.getParentArchetypeId() != null && source.getParentArchetypeId().getValue() != null) {
            parent = getFlatArchetype(source.getParentArchetypeId().getValue());
        }
        return flattener.flatten(parent, source);
    }

    @Override
    public List<ArchetypeInfo> getArchetypeInfos() {
        throw new UnsupportedOperationException();
    }
}
