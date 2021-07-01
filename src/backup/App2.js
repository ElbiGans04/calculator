import React, { useCallback, useContext, useEffect, useState } from "react";
import styleApp from "./App.module.css";
let Context = React.createContext({});

export default function App() {
  let [actions, setActions] = useState([]);

  let update = useCallback((val) => {
    // Jika nilainya null
    if (val === null) setActions([]);
    else
      setActions((prev) => {
        // Check If Operation
        const isOperation = checkIfSame(val);
        const prevIsOperation = checkIfSame(prev[prev.length - 1]);
        if (prev.length <= 0 && (isOperation.done || parseInt(val) === 0))
          return [...prev];

        // Jika sebelumnya sudah operasi juga
        // contoh [+, +] itu tidak boleh
        if (isOperation && prevIsOperation) return [...prev];
        return [...prev, val];
      });
  }, []);

  // useEffect(() => {
  //   document.body.addEventListener("keydown", (event) => {
  //     const key = event.key,
  //       isOperation = checkIfSame(key),
  //       isNumber = checkIfSame(parseInt(key), [1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);

  //     // Check Jika itu adalah operasi atau angka
  //     if (isOperation || isNumber)
  //       setActions((prev) => [...prev, isNumber ? parseInt(key) : key]);

  //     // Jika backspace
  //     if (key === "Backspace") {
  //       setActions((prev) => {
  //         let newPrev = [...prev];
  //         newPrev.pop();
  //         return newPrev;
  //       });
  //     }

  //     if (key === "Delete") setActions([]);
  //   });
  // }, []);

  return (
    <Context.Provider value={{ update, actions }}>
      <div className={styleApp.app}>
        <div className={styleApp.heading}>
          <h1>Calculator</h1>
        </div>
        <Display />
        <Main />
        <footer className={styleApp.footer}>
          Made with ❤ by <a href="https://elbi.vercel.app">Rhafael Bijaksana</a>
        </footer>
      </div>
    </Context.Provider>
  );
}

function Display(props) {
  let { actions } = useContext(Context);
  let number = ``;
  let numbers = [];
  let operations = [];
  let avoidVal = [];
  let finalResult = 0;
  let value = actions.length <= 0 ? "0" : "";

  // Lakukan Pengulangan
  actions.forEach((val, idx) => {
    const isOperation = checkIfSame(val);
    if (isOperation.done) {
      value += ` ${val} `;
      numbers[numbers.length - 1] = number;
      numbers.push("");
      operations.push({
        val,
        prev: numbers.length - 2,
        next: numbers.length - 1,
        done: false,
        addUp: null
      });
      number = ``;
    } else {
      value += `${val}`;
      number += val;
      if (numbers.length === 0) numbers.push("");
      if (!isOperation) numbers[numbers.length - 1] += `${val}`;
    }
  });

  // urutkan operasi bedasarkan kukabataku ( kurung, kali , bagi, tambah, kurang)
  operations = operations.sort((a, b) => {
    const { type } = checkIfSame(a.val);
    const { type: type2 } = checkIfSame(b.val);

    // Compare
    // Jika sama
    // expect X > / >  + > -
    if (type === type2) return 0;

    // Pada perkalian
    if (type === "kali") return -1;

    // Pada Pembagian
    if (type === "bagi" && type2 !== "kali") return -1;

    // Pada Penjumlahan
    if (type === "tambah" && type2 !== "kali" && type2 !== "bagi") return -1;

    // Pada Pengurangan
    if (
      type === "kurang" &&
      type2 !== "kali" &&
      type2 !== "bagi" &&
      type2 !== "tambah"
    )
      return -1;

    return 1;
  });

  // Jumlahkan
  for (let operation of operations) {
    let { prev, next } = operation;
    let { type } = checkIfSame(operation.val);
    console.log('\n')
    let checkDone = checkIfDone(operations, prev, next);
    let prevValue = checkDone.prev?.done || parseInt(numbers[prev]);
    let nextValue = checkDone.next?.done || parseInt(numbers[next]);

    // Tambahkan nilai yang dihindari
    if (checkDone.prev !== false) avoidVal.push(prev);
    if (checkDone.next !== false) avoidVal.push(next);


    if (!Number.isNaN(next)) {
      switch (type) {
        case "kali":
          operation.done = prevValue * nextValue;
          break;
        case "bagi":
          operation.done = prevValue / nextValue;
          break;
        case "tambah":
          operation.done = prevValue + nextValue;
          break;
        case "kurang":
          operation.done = prevValue - nextValue;
          break;
      }
    }

    if(checkDone.prev) findOperator(operations, checkDone.prev, operation.done);
    if(checkDone.next) findOperator(operations, checkDone.next, operation.done);
    // finalResult += result;
  }

  console.log(operations)
  return (
    <div className={styleApp.display}>
      <div>{value}</div>
      <div>{operations.length > 0 ? finalResult : value}</div>
    </div>
  );
}

function Main(props) {
  let { update } = useContext(Context);
  return (
    <div className={styleApp.main}>
      <button className={styleApp.delete} onClick={() => update(null)}>
        Delete
      </button>
      <button className={styleApp.backspace}>Backspace</button>
      <Button />
      <div className={styleApp.additional}>
        <button>{"<"}</button>
      </div>
    </div>
  );
}

function Button(props) {
  let { update } = useContext(Context);
  let number = [
    {
      val: 0,
      class: ["nol", "angka"],
    },
    {
      val: 1,
      class: ["satu", "angka"],
    },
    {
      val: 2,
      class: ["dua", "angka"],
    },
    {
      val: 3,
      class: ["tiga", "angka"],
    },
    {
      val: 4,
      class: ["empat", "angka"],
    },
    {
      val: 5,
      class: ["lima", "angka"],
    },
    {
      val: 6,
      class: ["enam", "angka"],
    },
    {
      val: 7,
      class: ["tujuh", "angka"],
    },
    {
      val: 8,
      class: ["delapan", "angka"],
    },
    {
      val: 9,
      class: ["sembilan", "angka"],
    },
    {
      val: "+",
      class: ["tambah", "action"],
    },
    {
      val: "-",
      class: ["kurang", "action"],
    },
    {
      val: "*",
      class: ["kali", "action"],
    },
    {
      val: "/",
      class: ["bagi", "action"],
    },
    {
      val: "=",
      class: ["enter"],
    },
  ];
  let newNumber = number.map((val, idx) => {
    let styleButton = "";
    val.class.forEach((val) => {
      styleButton += `${styleApp[val]} `;
    });
    return (
      <button className={styleButton} key={idx} onClick={() => update(val.val)}>
        {val.val}
      </button>
    );
  });
  return newNumber;
}

function checkIfSame(val, custom) {
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

// function checkIfSame(val, custom) {
//   let operations = custom ? custom : ["+", "-", "*", "/"];
//   for (let operation of operations) {
//     if (val === operation) return true;
//   }

//   return false;
// }

function checkIfDone(listOperations, prev, next) {
  let operations = [...listOperations];
  let results = [];
  let finalResult = {next: false, prev: false};
  for (let operation of operations) {
    if (operation.done !== false) {
      results.push({
        prev:
          (operation.next === prev || operation.prev === prev) &&
          operation,
        next:
          (operation.next === next || operation.prev === next) &&
          operation,
      });
    }
  };

  results.forEach((value) => {
    if (value.prev !== false) finalResult.prev = value.prev;
    if (value.next !== false) finalResult.next = value.next;
  });

  return results.length > 0 ? finalResult : { next: false, prev: false };
};


function findOperator (operations, target, value) {
  operations.forEach((operation, idx) => {
    if(operation.prev === target.prev && operation.next === target.next){
      operation.addUp = false;
      // operation.done = value
    }
  })
}