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

package org.openehr.designer;


import com.google.common.base.Charsets;

import java.io.IOException;
import java.io.InputStreamReader;
import java.util.Properties;

/**
 * @author markopi
 */
public class Configuration {
    private static volatile Properties properties=null;

    private static void initProperties() {
        try {
            if (properties==null) {
                Properties props = new Properties();
                props.load(new InputStreamReader(Configuration.class.getClassLoader()
                        .getResourceAsStream("config.properties"), Charsets.UTF_8));
                properties=props;
            }
        } catch (IOException e) {
            throw new RuntimeException("Error loading app properties", e);
        }
    }

    public static String get(String property) {
        initProperties();
        String value = properties.getProperty(property);
        if (value==null) {
            throw new RuntimeException("No such property: " + property);
        }
        return value;
    }
}
