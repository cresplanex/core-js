/**
 * Performance API
 */

/**
 * Set a “mark” at any location.
 * 
 * performance.mark('startTask');
 * Processing
 * performance.mark('endTask');
 */
export const mark = performance.mark.bind(performance)
/**
 * Measure the elapsed time between marks already set and 
 * create a measurement result (measure entry)
 * 
 * performance.measure('taskDuration', 'startTask', 'endTask');
 * const measures = performance.getEntriesByName('taskDuration');
 * console.log(`Performance time: ${measures[0].duration}ms`);
 */
export const measure = performance.measure.bind(performance)
/**
 * Returns the current time with a high-precision timestamp 
 * (in milliseconds, including decimal places).
 * 
 * const start = performance.now();
 * Processing
 * const end = performance.now();
 * console.log(`Performance time: ${end - start}ms`);
 */
export const now = performance.now.bind(performance)
/**
 * Get an array of performance entries of the specified type 
 * (e.g., “mark”, “measure”, “resource”, etc.).
 * 
 * const measures = performance.getEntriesByType('measure');
 * measures.forEach((m) => console.log(`${m.name}: ${m.duration}ms`));
 */
export const getEntriesByType = performance.getEntriesByType.bind(performance)
/**
 * Clear (delete) set marks and measurement results.
 * 
 * performance.clearMarks('startTask');
 * performance.clearMeasures('taskDuration');
 */
export const clearMarks = performance.clearMarks.bind(performance)
export const clearMeasures = performance.clearMeasures.bind(performance)