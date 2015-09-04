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

package org.openehr.designer.repository;

import java.util.List;

/**
 * @author markopi
 */
public interface ScmEnabled {
    public void commit(String message);

    public void update();

    public List<DiffItem> status();


    public static enum ChangeType {
        ADD, MODIFY, DELETE
    }

    public static class DiffItem {
        private String path;
        private ChangeType changeType;

        public String getPath() {
            return path;
        }

        public void setPath(String path) {
            this.path = path;
        }

        public ChangeType getChangeType() {
            return changeType;
        }

        public void setChangeType(ChangeType changeType) {
            this.changeType = changeType;
        }

        @Override
        public String toString() {
            return (changeType != null ? changeType.name().substring(0,1) : "?") + " " + path;
        }
    }
}
