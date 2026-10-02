
function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}


export async function runBubbleSort(
  originalArray,
  setArray,
  setComparingIndices,
  setSortedIndices,
  delayInMs
) {
  let workingArray = [...originalArray];
  let totalItems = workingArray.length;

  for (let i = 0; i < totalItems - 1; i++) {
    for (let j = 0; j < totalItems - i - 1; j++) {
      setComparingIndices([j, j + 1]);
      await sleep(delayInMs);

      if (workingArray[j].value > workingArray[j + 1].value) {
        let temporaryHolder = workingArray[j];
        workingArray[j] = workingArray[j + 1];
        workingArray[j + 1] = temporaryHolder;

        // Because each bar has a stable "id", Framer Motion will
        // automatically animate the bars sliding into their new spots.
        setArray([...workingArray]);
        await sleep(delayInMs);
      }
    }

    setSortedIndices((previousSortedList) => [
      ...previousSortedList,
      totalItems - i - 1,
    ]);
  }

  setSortedIndices((previousSortedList) => [...previousSortedList, 0]);
  setComparingIndices([]);
}

// ============================================================
// MERGE SORT (iterative "bottom-up" version — no recursion,
// just simple loops, so it's easier to trace step by step)
//
// The idea: first treat every single bar as a "sorted mini-list
// of size 1". Then merge neighboring mini-lists of size 1 into
// sorted lists of size 2. Then merge those into sorted lists of
// size 4. Keep doubling the list size until the whole array is
// one single sorted list.
// ============================================================
export async function runMergeSort(
  originalArray,
  setArray,
  setComparingIndices,
  setSortedIndices,
  delayInMs
) {
  let workingArray = [...originalArray];
  let totalItems = workingArray.length;

  // "width" is the size of the sorted chunks we are currently merging.
  // It starts at 1 and doubles every pass: 1 -> 2 -> 4 -> 8 -> ...
  for (let width = 1; width < totalItems; width = width * 2) {
    // Walk through the array, picking out pairs of chunks to merge
    for (let leftStart = 0; leftStart < totalItems; leftStart = leftStart + width * 2) {
      let leftEnd = Math.min(leftStart + width, totalItems);
      let rightEnd = Math.min(leftStart + width * 2, totalItems);

      // These two pointers walk through the left chunk and right chunk
      let leftIndex = leftStart;
      let rightIndex = leftEnd;

      // This will hold the merged (sorted) result of the two chunks
      let mergedSection = [];

      // Compare the front of each chunk and take the smaller one first
      while (leftIndex < leftEnd && rightIndex < rightEnd) {
        setComparingIndices([leftIndex, rightIndex]);
        await sleep(delayInMs);

        if (workingArray[leftIndex].value <= workingArray[rightIndex].value) {
          mergedSection.push(workingArray[leftIndex]);
          leftIndex = leftIndex + 1;
        } else {
          mergedSection.push(workingArray[rightIndex]);
          rightIndex = rightIndex + 1;
        }
      }

      // If the left chunk still has leftover bars, add them all
      while (leftIndex < leftEnd) {
        mergedSection.push(workingArray[leftIndex]);
        leftIndex = leftIndex + 1;
      }

      // If the right chunk still has leftover bars, add them all
      while (rightIndex < rightEnd) {
        mergedSection.push(workingArray[rightIndex]);
        rightIndex = rightIndex + 1;
      }

      // Write the merged, sorted section back into the working array
      for (let i = 0; i < mergedSection.length; i++) {
        workingArray[leftStart + i] = mergedSection[i];
      }

      // Show the newly merged order — bars will slide into place
      setArray([...workingArray]);
      await sleep(delayInMs);
    }
  }

  // Once every pass is done, the whole array is sorted
  let allIndices = [];
  for (let i = 0; i < totalItems; i++) {
    allIndices.push(i);
  }
  setSortedIndices(allIndices);
  setComparingIndices([]);
}

// ============================================================
// LINEAR SEARCH
// Checks every bar one by one until it finds the target value.
// ============================================================
export async function runLinearSearch(
  array,
  targetValue,
  setComparingIndices,
  setFoundIndex,
  setEliminatedIndices,
  delayInMs
) {
  for (let i = 0; i < array.length; i++) {
    setComparingIndices([i]);
    await sleep(delayInMs);

    if (array[i].value === targetValue) {
      setFoundIndex(i);
      setComparingIndices([]);
      return true;
    } else {
      setEliminatedIndices((previousList) => [...previousList, i]);
    }
  }

  setComparingIndices([]);
  return false;
}

// ============================================================
// BINARY SEARCH
// Only works correctly on a SORTED array. Repeatedly checks the
// middle bar and narrows the search range in half each time.
// ============================================================
export async function runBinarySearch(
  array,
  targetValue,
  setComparingIndices,
  setFoundIndex,
  setEliminatedIndices,
  delayInMs
) {
  let lowIndex = 0;
  let highIndex = array.length - 1;

  while (lowIndex <= highIndex) {
    let middleIndex = Math.floor((lowIndex + highIndex) / 2);

    setComparingIndices([middleIndex]);
    await sleep(delayInMs);

    if (array[middleIndex].value === targetValue) {
      setFoundIndex(middleIndex);
      setComparingIndices([]);
      return true;
    } else if (array[middleIndex].value < targetValue) {
      let eliminatedRange = [];
      for (let k = lowIndex; k <= middleIndex; k++) {
        eliminatedRange.push(k);
      }
      setEliminatedIndices((previousList) => [...previousList, ...eliminatedRange]);
      lowIndex = middleIndex + 1;
    } else {
      let eliminatedRange = [];
      for (let k = middleIndex; k <= highIndex; k++) {
        eliminatedRange.push(k);
      }
      setEliminatedIndices((previousList) => [...previousList, ...eliminatedRange]);
      highIndex = middleIndex - 1;
    }

    await sleep(delayInMs);
  }

  setComparingIndices([]);
  return false;
}
