export function checkIfSame(val, custom) {
    let operations = custom ? custom : ["+", "-", "*", "/"];
    let index = 0;
    let operationsName = ["tambah", "kurang", "kali", "bagi"];
    for (let operation of operations) {
      if (val === operation) {
        if (custom) return { done: true };
        else return { done: true, type: operationsName[index] };
      }
  
      index++;
    }
  
    return false;
  }
  
export function checkIfDone(listOperations, prev, next, index) {
    let results = { prev: false, next: false },
      rawResults = [];
  
    listOperations.forEach((operation) => {
      if (operation.done !== false) {
        rawResults.push({
          prev: (operation.next === prev || operation.prev === prev) && operation,
          next: (operation.next === next || operation.prev === next) && operation,
        });
      }
    });
  
    // Filter
    // Harusnya disini ada fitur untuk mencari lebih dalam lagi
    // tinggal membuat fitur searching infinity
    rawResults.forEach((operation) => {
      if (operation.next !== false) results.next = deep(operation.next, index, listOperations);
      if (operation.prev !== false) results.prev = deep(operation.prev, index, listOperations);
    });
  
    return results;
  }
  
function deep(test, index, operations) {
    let sing = test.used !== undefined ? operations[test.used] : test;
    while (sing.used) {
      sing = operations[sing.used];
    }
  
    sing.used = index;
    return sing;
  };