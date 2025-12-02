//function to find the second largest number in an array
function secondLargest(arr) {
  if (arr.length < 2) return null;

  let largest = -Infinity;
  let second = -Infinity;

  for (const num of arr) {
    if (num > largest) {
      second = largest;
      largest = num;
    } else if (num > second && num !== largest) {
      second = num;
    }
  }

  return second === -Infinity ? null : second;
}

// test
console.log(secondLargest([5, 1, 9, 6, 2])); // 6
console.log(secondLargest([10, 10, 9])); // 9
console.log(secondLargest([7])); // null
