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

import java.util.Iterator;
import java.util.List;
import java.util.function.Predicate;

/**
 * @author Marko Pipan
 */
public class WtUtils {
    public static String overrideNodeId(String nodeId) {
        if (nodeId == null) return null;
        return nodeId + ".1";
    }

    public static String parentNodeId(String nodeId) {
        int pos = nodeId.lastIndexOf('.');
        return nodeId.substring(0, pos);
    }

    public static <T> Iterable<T> iterable(Iterator<T> iterator) {
        return () -> iterator;
    }

    public static <T> int indexOf(List<T> list, Predicate<T> predicate, int startIndex) {
        for (int i = 0; i < list.size(); i++) {
            T t = list.get(i);
            if (predicate.test(t)) {
                return i;
            }
        }
        return -1;
    }

    /**
     * Returns index of first element in list, or -1 if no predicate matches. Works like List.indexOf, but can
     * use any test condition.
     *
     * @param list list through which to search
     * @param predicate test condition
     * @param <T> type of list elements
     * @return index of the first matched item, or -1 if no item found
     */
    public static <T> int indexOf(List<T> list, Predicate<T> predicate) {
        return indexOf(list, predicate, 0);
    }

}
