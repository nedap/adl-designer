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
