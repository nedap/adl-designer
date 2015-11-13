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
import com.google.common.collect.Lists;
import org.openehr.designer.Configuration;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * @author markopi
 */
@RequestMapping("/app")
@RestController
public class AppResource {

    @RequestMapping(value = "/configuration", method = RequestMethod.GET)
    public Map<String, Object> getAppConfiguration() {
        Map<String, Object> result = new LinkedHashMap<>();
        ImmutableList.of("github.api.auth.client_id")
                .forEach((k) -> result.put(k, Configuration.get(k)));
        return result;
    }
}
