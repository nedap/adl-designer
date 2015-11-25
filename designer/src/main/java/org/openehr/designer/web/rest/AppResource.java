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

package org.openehr.designer.web.rest;

import com.google.common.collect.ImmutableList;
import com.google.common.collect.ImmutableSortedMap;
import org.openehr.designer.Configuration;
import org.openehr.designer.util.WtUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.PostConstruct;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Properties;
import java.util.SortedMap;

/**
 * @author markopi
 */
@RequestMapping("/app")
@RestController
public class AppResource {
    private Map<String, String> appProperties;

    @PostConstruct
    public void init() throws IOException {
        Properties properties = new Properties();
        try (InputStream appStream = getClass().getClassLoader().getResourceAsStream("app.properties");
             Reader reader = new InputStreamReader(appStream, StandardCharsets.UTF_8)) {
            properties.load(reader);
            appProperties = ImmutableSortedMap.copyOf(WtUtils.uncheckedCast(properties));

        }
    }

    @RequestMapping(value = "/configuration", method = RequestMethod.GET)
    public Map<String, Object> getAppConfiguration(HttpServletRequest req) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.putAll(appProperties);
        return result;
    }
}
