/*
 * ADL2-tools
 * Copyright (c) 2013-2014 Marand d.o.o. (www.marand.com)
 *
 * This file is part of ADL2-tools.
 *
 * ADL2-tools is free software: you can redistribute it and/or modify
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

package org.openehr.designer.repository;

import org.openehr.adl.FlatArchetypeProvider;
import org.openehr.adl.flattener.ArchetypeFlattener;
import org.openehr.adl.rm.RmModel;
import org.openehr.jaxb.am.DifferentialArchetype;
import org.openehr.jaxb.am.FlatArchetype;

/**
 * @author markopi
 */
public class FlatArchetypeRepository implements FlatArchetypeProvider {
    private ArchetypeRepository repository;
    private final org.openehr.adl.flattener.ArchetypeFlattener flattener;

    public FlatArchetypeRepository(ArchetypeRepository repository, RmModel rmModel) {
        this.repository = repository;
        this.flattener = new ArchetypeFlattener(rmModel);
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
    public DifferentialArchetype getDifferentialArchetype(String archetypeId) {
        return repository.getDifferentialArchetype(archetypeId);
    }
}
