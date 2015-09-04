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

        List<DifferentialArchetype> archetypes = TemplateDeserializer.deserialize(templateAdlt);
    }
}