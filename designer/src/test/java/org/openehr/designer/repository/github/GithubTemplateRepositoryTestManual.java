/*
 * ADL Designer
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

package org.openehr.designer.repository.github;

import com.google.common.base.Charsets;
import com.google.common.io.ByteStreams;
import org.junit.Before;
import org.junit.Test;
import org.openehr.adl.parser.AdlDeserializer;
import org.openehr.designer.io.TemplateDeserializer;
import org.openehr.jaxb.am.Archetype;

import java.io.IOException;
import java.util.List;

/**
 * @author markopi
 */
public class GithubTemplateRepositoryTestManual {
    private static final String BRANCH = "markopi64";
    private static final String ACCESS_TOKEN = "685aa3ff4f98ec528229aa233c1d863be6a9431e";
    private static final String REPO = "markopi64/adl-models";

    GithubTemplateRepository repository;

    @Before
    public void init() throws Exception {
        repository = new GithubTemplateRepository();
        repository.init(BRANCH, ACCESS_TOKEN, REPO);
    }

    @Test
    public void saveTemplate() throws IOException {
        List<Archetype> archetypes = TemplateDeserializer.deserialize(getClass().getClassLoader()
                .getResourceAsStream("template/openEHR-EHR-COMPOSITION.a.v1.0.0.adlt"));
        repository.saveTemplate(archetypes);
    }

}