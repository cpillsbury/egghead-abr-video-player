// TODO: ES6.
// TODO move (and potentially refactor) Interval.
// TODO: Refactor partial appl for adding fns to Interval proto.

'use strict';

export function isLessThan(x, y, tolerance) {
    tolerance = tolerance || 0;
    return ((x - tolerance) > (y + tolerance));
}

export function isGreaterThan(x, y, tolerance) {
    return isLessThan(y, x, tolerance);
}

export function isEqualTo(x, y, tolerance) {
    tolerance = tolerance || 0;
    return Math.abs(x - y) <= tolerance;
}

export function isLessThanOrEqualTo(x, y, tolerance) {
    return isLessThan(x, y, tolerance) ||
        isEqualTo(x, y, tolerance);
}

export function isGreaterThanOrEqualTo(x, y, tolerance) {
    return isGreaterThan(x, y, tolerance) ||
        isEqualTo(x, y, tolerance);
}

export function before(xStart, xEnd, yStart, yEnd, tolerance) {
    return isLessThan(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isLessThan(xEnd, yStart, tolerance) &&
        isLessThan(xEnd, yEnd, tolerance);
}

export function after(xStart, xEnd, yStart, yEnd, tolerance) {
    return before(yStart, yEnd, xStart, xEnd, tolerance);
}

export function meets(xStart, xEnd, yStart, yEnd, tolerance) {
    return isLessThan(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isEqualTo(xEnd, yStart, tolerance) &&
        isLessThan(xEnd, yEnd, tolerance);
}

export function metBy(xStart, xEnd, yStart, yEnd, tolerance) {
    return meets(yStart, yEnd, xStart, xEnd, tolerance);
}

export function overlaps(xStart, xEnd, yStart, yEnd, tolerance) {
    return isLessThan(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isGreaterThan(xEnd, yStart, tolerance) &&
        isLessThan(xEnd, yEnd, tolerance);
}

export function overlappedBy(xStart, xEnd, yStart, yEnd, tolerance) {
    return overlaps(yStart, yEnd, xStart, xEnd, tolerance);
}

export function during(xStart, xEnd, yStart, yEnd, tolerance) {
    return isGreaterThan(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isGreaterThan(xEnd, yStart, tolerance) &&
        isLessThan(xEnd, yEnd, tolerance);
}

export function includes(xStart, xEnd, yStart, yEnd, tolerance) {
    return during(yStart, yEnd, xStart, xEnd, tolerance);
}

export function starts(xStart, xEnd, yStart, yEnd, tolerance) {
    return isEqualTo(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isGreaterThan(xEnd, yStart, tolerance) &&
        isLessThan(xEnd, yEnd, tolerance);
}

export function startedBy(xStart, xEnd, yStart, yEnd, tolerance) {
    return starts(yStart, yEnd, xStart, xEnd, tolerance);
}

export function finishes(xStart, xEnd, yStart, yEnd, tolerance) {
    return isGreaterThan(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isGreaterThan(xEnd, yStart, tolerance) &&
        isEqualTo(xEnd, yEnd, tolerance);
}

export function finishedBy(xStart, xEnd, yStart, yEnd, tolerance) {
    return finishes(yStart, yEnd, xStart, xEnd, tolerance);
}

export function equalTo(xStart, xEnd, yStart, yEnd, tolerance) {
    return isEqualTo(xStart, yStart, tolerance) &&
        isLessThan(xStart, yEnd, tolerance) &&
        isEqualTo(xEnd, yStart, tolerance) &&
        isGreaterThan(xEnd, yEnd, tolerance);
}

// Comparison-related functions
export function isLowerThan(xStart, xEnd, yStart, yEnd, tolerance) {
    return isLessThan(xStart, yStart, tolerance) ||
        starts(xStart, xEnd, yStart, yEnd, tolerance);
}

export function isHigherThan(xStart, xEnd, yStart, yEnd, tolerance) {
    return isLowerThan(yStart, yEnd, xStart, xEnd, tolerance);
}

export function compareIntervals(xStart, xEnd, yStart, yEnd, tolerance) {
    if(isLowerThan(xStart, xEnd, yStart, yEnd, tolerance)) { return -1; }
    if(isHigherThan(xStart, xEnd, yStart, yEnd, tolerance)) { return 1; }
    if (isSameAs(xStart, xEnd, yStart, yEnd, tolerance)) { return 0; }
    // Default behavior, but should not reach this line. (Throw Error instead?)
    return 0;
}

export function containsPoint(point, start, end, tolerance) {
    return isGreaterThanOrEqualTo(point, start, tolerance) &&
        isLessThanOrEqualTo(point, end, tolerance);
}

export function isTouching(xStart, xEnd, yStart, yEnd, tolerance) {
    return containsPoint(xStart, yStart, yEnd, tolerance) ||
        containsPoint(xEnd, yStart, yEnd, tolerance);
}

// TODO: Move into another js file.
function isNumberStrict(value) { return typeof value === 'number' && !Number.isNaN(value); }

// Transformation functions

/**
 *
 * @param point {number}
 * @param intervalLength {number}
 * @param startOffset {number}
 * @returns {number}
 */
export function alignPointToStandardInterval(point, intervalLength, startOffset) {
    return (Math.round((point - startOffset) / intervalLength ) * intervalLength) + startOffset;
}

/**
 *
 * @param point
 * @param newStartOffset
 * @param originalStartOffset
 * @param unitsRatio
 */
export function translatePointToNewIntervalSpace(point, newStartOffset, originalStartOffset, unitsRatio) {
    if (!isNumberStrict(newStartOffset)) { newStartOffset = 0; }
    if (!isNumberStrict(originalStartOffset)) { originalStartOffset = 0; }
    if (!isNumberStrict(unitsRatio)) { unitsRatio = 1; }
    return (point - originalStartOffset) * unitsRatio + newStartOffset;
}

// TODO: Move into another js file
var genericObjType = function(){},
    objectRef = new genericObjType();

var isFunction = function(value) {
    return typeof value === 'function';
};
// fallback for older versions of Chrome and Safari
if (isFunction(/x/)) {
    isFunction = function(value) {
        return typeof value === 'function' && objectRef.toString.call(value) === '[object Function]';
    };
}

export function compareIntervalObjects(a, b, tolerance) {
    return compareIntervals(a.getStart(), a.getEnd(), b.getStart(), b.getEnd(), tolerance);
}

function createChainableIntervalAlgebraFn(intervalAlgebraFn) {
    return function(timeRange, tolerance) {
        return intervalAlgebraFn(this.getStart(), this.getEnd(), timeRange.getStart(), timeRange.getEnd(), tolerance);
    };
}

function Interval(start, end) {
    // This allows for creating a Facade/Data View for another object type.
    this.getStart = isFunction(start) ? start : function() { return start; };
    this.getEnd = isFunction(end) ? end : function() { return end; };
}

Interval.prototype.getDuration = function() { return this.getEnd() - this.getStart(); };
Interval.prototype.getMidpoint = function() { return this.getStart() + (this.getDuration() / 2); };

Interval.prototype.before = createChainableIntervalAlgebraFn(before);
Interval.prototype.after = createChainableIntervalAlgebraFn(after);
Interval.prototype.meets = createChainableIntervalAlgebraFn(meets);
Interval.prototype.metBy = createChainableIntervalAlgebraFn(metBy);
Interval.prototype.overlaps = createChainableIntervalAlgebraFn(overlaps);
Interval.prototype.overlappedBy = createChainableIntervalAlgebraFn(overlappedBy);
Interval.prototype.during = createChainableIntervalAlgebraFn(during);
Interval.prototype.includes = createChainableIntervalAlgebraFn(includes);
Interval.prototype.starts = createChainableIntervalAlgebraFn(starts);
Interval.prototype.startedBy = createChainableIntervalAlgebraFn(startedBy);
Interval.prototype.finishes = createChainableIntervalAlgebraFn(finishes);
Interval.prototype.finishedBy = createChainableIntervalAlgebraFn(finishedBy);
Interval.prototype.equalTo = createChainableIntervalAlgebraFn(equalTo);

/**
 *
 * @param intervalLength
 * @param startOffset
 * @param persistOriginRef
 * @returns {Interval}
 */
Interval.prototype.alignTo = function(intervalLength, startOffset, persistReferences) {
    var self = this,
        newStart,
        newEnd;

    // NOTE: If we're using this Interval as a data view, may want to persist the reference to it in the
    //      aligned Interval object instance we're returning (See: Interval constructor)
    newStart = persistReferences ?
        function() { return alignPointToStandardInterval(self.getStart(), intervalLength, startOffset) } :
        alignPointToStandardInterval(self.getStart(), intervalLength, startOffset);
    newEnd = persistReferences ?
        function() { return alignPointToStandardInterval(self.getEnd(), intervalLength, startOffset) } :
        alignPointToStandardInterval(self.getEnd(), intervalLength, startOffset);

    return new Interval(newStart, newEnd);
};

Interval.prototype.translateTo = function(newStartOffset, originalStartOffset, unitsRatio, persistReferences) {
    var self = this,
        newStart,
        newEnd;

    // NOTE: If we're using this Interval as a data view, may want to persist the reference to it in the
    //      aligned Interval object instance we're returning (See: Interval constructor)
    newStart = persistReferences ?
        function() { return translatePointToNewIntervalSpace(self.getStart(), newStartOffset, originalStartOffset, unitsRatio) } :
        translatePointToNewIntervalSpace(self.getStart(), newStartOffset, originalStartOffset, unitsRatio);
    newEnd = persistReferences ?
        function() { return translatePointToNewIntervalSpace(self.getEnd(), newStartOffset, originalStartOffset, unitsRatio) } :
        translatePointToNewIntervalSpace(self.getEnd(), newStartOffset, originalStartOffset, unitsRatio);

    return new Interval(newStart, newEnd);
};

function sortIntervalArray(array, tolerance) {
    // TODO: check by 'interface'? (CJP)
    // TODO: Make polymorphic (obj.keys() + map, Array.prototype.sort for arraylikes, etc.) (CJP)
    return [...array].sort(
        function(a, b) {
            return compareIntervalObjects(a, b, tolerance);
        }
    );
}