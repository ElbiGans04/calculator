import React, { useCallback, useContext, useEffect, useState } from "react";
import {checkIfDone, checkIfSame} from './lib/module.js';
import styleApp from "./App.module.css";
let Context = React.createContext({});

export default function App() {
  let [actions, setActions] = useState([]);
  let [fullMode, setFullMode] = useState(true);

  let updateFullMode = useCallback(() => {
    setFullMode(true);
  }, []);

  useEffect(() => {
    document.body.addEventListener("keydown", (event) => {
      const key = event.key,
      button = document.querySelectorAll('#main button');

      // Cocokan
      button.forEach((val) => {
        if(val.textContent === key) val.click()
      });
    });
  }, []);



  let generateResult = useCallback(function () {
    let data = [...actions];
  
    // berfungsi untuk menampung nilai
    let number = ``;
    // Tampung nilai antara operator
    let numbers = [];
    // Buat array object yang berisi operation dan nilai `prev` dan `next`
    let operations = [];
    // Siapkan variabel untuk 
    let finalResult = 0;
    let display = data.length <= 0 ? "0" : "";
  
    // Lakukan Pengulangan
    data.forEach((val) => {
  
      // Check apakah Nilai tersebut adalah sebuah operation
      const isOperation = checkIfSame(val);
  
      if (isOperation.done) {
        // Tambahkan spasi (Jika nilainya adalah operator)
        display += ` ${val} `;
        // overwrite numbers terakhir dengan number yang sudah dikumpulkan
        numbers[numbers.length - 1] = number;
  
        // Tambahkan anggota numbers
        // Karena Jika sudah memasukan operator kita harus membuat penampung yang
        // baru
        numbers.push("");
  
        // Tambahkan ke operation
        operations.push({
          val,
          prev: numbers.length - 2,
          next: numbers.length - 1,
          done: false,
        });
  
        // Reset 
        number = ``;
      } else {
        display += `${val}`;
        number += val;
  
        // Jika masih awal tambahkan string kosong
        if (numbers.length === 0) numbers.push("");
  
        // Jika sebelumnya sudah ditambahkan maka tambahkan
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
    operations.forEach((operation, index) => {
      let { prev, next } = operation;
      let { type } = checkIfSame(operation.val);
      let checkDone = checkIfDone(operations, prev, next, index);
      let prevValue = checkDone?.prev?.done || parseInt(numbers[prev]);
      let nextValue = checkDone?.next?.done || parseInt(numbers[next]);
  
      if (!Number.isNaN(nextValue)) {
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
    });
  
    operations.forEach((val) => {
      if (!val.used) finalResult += val.done;
    });

    if(operations.length <= 0 ) finalResult = display;
  
  
    return {display, result: finalResult, operations}
  }, [actions]);


  let update = useCallback((val) => {

    // Check Nilai fullmode 
    if (fullMode === true) {
      let isOperation = checkIfSame(val);
      let {result: data} = generateResult();
      
      // Set Full Mode
      setFullMode(false);

      if(isOperation) setActions([`${data}`, val]);
      else if(val !== null) setActions(val === false ? [] : [val]);

      // Jika null
      if(val === null) {
        data = `${data}`
        let resultElement2 = data.split()[0];
        let final = resultElement2.slice(0, resultElement2.length - 1);
        let result = final.length > 0 ? [...final] : [];
        setActions(result);
      }
    } else {
      // Jika nilainya null
      if (val === false) setActions([]);
      else if(val === null) setActions((val) => val.slice(0, val.length - 1))
      else {
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
      }
    }
  }, [fullMode, generateResult]);
  

  return (
    <Context.Provider value={{ update, updateFullMode, fullMode, generateResult }}>
      <div className={styleApp.app}>
        <div className={styleApp.heading}>
          <h1>Calculator</h1>
        </div>
        <Display />
        <Main />
        <footer className={styleApp.footer}>
          Made with ??? by <a href="https://elbi.vercel.app">Rhafael Bijaksana</a>
        </footer>
      </div>
    </Context.Provider>
  );
}

function Display(props) {
  let {generateResult, fullMode } = useContext(Context);
  let { result, display} = generateResult();

  
  return (
    <div className={styleApp.display}>
      {!fullMode && <div>{display}</div>}
      <div id="result">{result}</div>
    </div>
  );
}

function Main(props) {
  let { update, updateFullMode } = useContext(Context);
  return (
    <div id="main" className={styleApp.main}>
      <button className={styleApp.delete} onClick={() => update(false)}>
        Delete
      </button>
      <button className={styleApp.backspace} onClick={() => update(null)}>Backspace</button>

      <button
        className={styleApp.satu}
        onClick={(e) => update(e.target.textContent)}
      >
        1
      </button>
      <button
        className={styleApp.dua}
        onClick={(e) => update(e.target.textContent)}
      >
        2
      </button>
      <button
        className={styleApp.tiga}
        onClick={(e) => update(e.target.textContent)}
      >
        3
      </button>
      <button
        className={styleApp.empat}
        onClick={(e) => update(e.target.textContent)}
      >
        4
      </button>
      <button
        className={styleApp.lima}
        onClick={(e) => update(e.target.textContent)}
      >
        5
      </button>
      <button
        className={styleApp.enam}
        onClick={(e) => update(e.target.textContent)}
      >
        6
      </button>
      <button
        className={styleApp.tujuh}
        onClick={(e) => update(e.target.textContent)}
      >
        7
      </button>
      <button
        className={styleApp.delapan}
        onClick={(e) => update(e.target.textContent)}
      >
        8
      </button>
      <button
        className={styleApp.sembilan}
        onClick={(e) => update(e.target.textContent)}
      >
        9
      </button>
      <button
        className={styleApp.nol}
        onClick={(e) => update(e.target.textContent)}
      >
        0
      </button>
      <button
        className={styleApp.tambah}
        onClick={(e) => update(e.target.textContent)}
      >
        +
      </button>
      <button
        className={styleApp.kurang}
        onClick={(e) => update(e.target.textContent)}
      >
        -
      </button>
      <button
        className={styleApp.kali}
        onClick={(e) => update(e.target.textContent)}
      >
        *
      </button>
      <button
        className={styleApp.bagi}
        onClick={(e) => update(e.target.textContent)}
      >
        /
      </button>
      <div className={styleApp.additional}>
        <button>{"<"}</button>
      </div>

      <div className={styleApp.enter}>
        <button  onClick={() => updateFullMode()}>
          Enter
        </button>
      </div>
    </div>
  );
};