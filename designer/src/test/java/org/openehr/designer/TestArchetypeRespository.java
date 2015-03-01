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

import java.io.IOException;
import java.io.InputStream;
import java.util.Properties;

/**
 * @author Marko Pipan
 */
public class TestArchetypeRespository {
    private static ArchetypeRepositoryImpl archetypeRepository;
    private static final String TEST_REPO_KEY = "test.repo";

    public static synchronized ArchetypeRepository getInstance() {
        if (archetypeRepository == null) {
            try {
                ArchetypeRepositoryImpl repo = new ArchetypeRepositoryImpl();
                repo.setRepositoryLocation(getPathFromRepoProperties());
                repo.init();
                archetypeRepository = repo;
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        return archetypeRepository;

    }

    private static String getPathFromRepoProperties() throws IOException {
        InputStream is = TestArchetypeRespository.class.getClassLoader().getResourceAsStream("repo.properties");
        if (is == null) {
            return getPathFromRepoPropertiesTemplate();
        } else {
            Properties p = new Properties();
            p.load(is);
            is.close();
            return p.getProperty(TEST_REPO_KEY);
        }
    }

    private static String getPathFromRepoPropertiesTemplate() throws IOException {

        InputStream is = TestArchetypeRespository.class.getClassLoader().getResourceAsStream("repo.properties-TEMPLATE");
        if (is == null) {
            throw new RuntimeException("No repo.properties or repo.properties-TEMPLATE found");
        } else {
            Properties p = new Properties();
            p.load(is);
            is.close();
            return p.getProperty(TEST_REPO_KEY);

        }
    }
}
