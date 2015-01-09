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

package org.openehr.designer.tom;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.openehr.designer.ObjectMapperFactoryBean;
import org.openehr.designer.tom.AbstractTom;
import org.openehr.designer.tom.TemplateTom;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author Marko Pipan
 */
public class TomDeserializerTest {
    ObjectMapper objectMapper;
    @BeforeClass
    public void setUp() throws Exception {
        ObjectMapperFactoryBean factory = new ObjectMapperFactoryBean();
        objectMapper = factory.getObject();
    }
    @Test
    public void testTerminologyCodeConstraint() throws IOException {
        final InputStream is = getClass().getClassLoader().getResourceAsStream("tom/terminology-code-constraint.json");
        AbstractTom tom = objectMapper.readValue(is, TemplateTom.class);
    }
}
