package org.openehr.designer.tom;

/**
 * @author Marko Pipan
 */
public class OccurrencesTom extends AbstractTom {
    private Integer lower;
    private Integer upper;

    public OccurrencesTom() {
    }

    public OccurrencesTom(Integer lower, Integer upper) {
        this.lower = lower;
        this.upper = upper;
    }

    public Integer getLower() {
        return lower;
    }

    public void setLower(Integer lower) {
        this.lower = lower;
    }

    public Integer getUpper() {
        return upper;
    }

    public void setUpper(Integer upper) {
        this.upper = upper;
    }
}
