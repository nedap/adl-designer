package org.openehr.designer;

import org.openehr.adl.FlatArchetypeProvider;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;

import java.util.List;

/**
 * @author Marko Pipan
 */
public interface ArchetypeRepository extends FlatArchetypeProvider {

    public RmModel getRmModel();

    public DifferentialArchetype getDifferentialArchetype(String archetypeId);

    public FlatArchetype getFlatArchetype(String archetypeId);

    public List<ArchetypeInfo> getArchetypeInfos();

}
