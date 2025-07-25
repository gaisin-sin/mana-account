import "./App.css";
import { useEffect, useState } from "react";

export interface MenuItem {
  name: string;
  price: number;
}

export const App = () => {
  

  const [Menus, setMenus] = useState<MenuItem[]>([]);

  const [Selected, SetSelected] = useState<{id: number, count: number}[]>([]);

  const [Sum, setSum] = useState(0);

  const [Put, setPut] = useState(0);

  

  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorDisplay, setCalculatorDisplay] = useState("0");
  const [calculatorInput, setCalculatorInput] = useState("");

  useEffect(() => {
    
   
    const ws = new WebSocket("wss://main.hackwordserver-sasaki-unko.com:5000");
    
    ws.onopen = () => {
      console.log("WebSocket接続が開かれました");
      ws.send(JSON.stringify({"type":"dataplz"}));
    }

    ws.onmessage = (ev) => {
      const data = JSON.parse(ev.data);
      console.log("RECIEVE");
      const Menus0 = data.Menu;
      let fixed: MenuItem[] = [];
      console.log("M", Menus0);
      Menus0.map((item) => {
        fixed.push({
          name: item.name,
          price: item.price,
        });
      });
      localStorage.setItem("MENU", JSON.stringify({"MENU":fixed}));
      console.log("MM", JSON.parse(localStorage.getItem("MENU")));
      
      setMenus(fixed);
    }
    
    ws.onerror = (error) => {
      if (localStorage.getItem("MENU") == null) {
                localStorage.setItem("MENU", JSON.stringify({"MENU":Menus}));
            }
          setMenus(JSON.parse(localStorage.getItem("MENU")).MENU);
    }
    
    ws.onclose = (event) => {
      console.log("WebSocket接続が閉じられました:", event.code, event.reason);
    }
    
   } , []);
  
  const AddMenu = (index : number) => {
    for (let i = 0;i < Selected.length;i++) {
      if (Selected[i].id == index) {
        const newSelected = [...Selected];
        newSelected[i].count++;
        SetSelected(newSelected);
        return;
      }
    }
    const newMenu = {
      id: index,

      count: 1
    };
    SetSelected([...Selected, newMenu]);
    return;
  }

  const Change = (index : number, dif : number) => {
    const news = [...Selected]
    if (news[index].count + dif <= 0) {
      news.splice(index, 1);
      SetSelected(news);
      return;
    }
    news[index].count += dif;
    console.log("NEW", news);
    SetSelected(news);
  }

  const AddPut = (money : number) => {
    setPut((state) => state+money);
  }

  const handleCalculatorNumber = (num: string) => {
    if (calculatorDisplay === "0") {
      setCalculatorDisplay(num);
    } else {
      setCalculatorDisplay(calculatorDisplay + num);
    }
  }

  const handleCalculatorClear = () => {
    setCalculatorDisplay("0");
    setCalculatorInput("");
  }

  const handleCalculatorEnter = () => {
    const amount = parseInt(calculatorDisplay);
    if (!isNaN(amount) && amount > 0) {
      AddPut(amount);
    }
    setShowCalculator(false);
    setCalculatorDisplay("0");
    setCalculatorInput("");
  }

  const handleCalculatorCancel = () => {
    setShowCalculator(false);
    setCalculatorDisplay("0");
    setCalculatorInput("");
  }


  const ALLCLEAR = () => {
    SetSelected([]);
    setPut(0);
  }

  useEffect(() =>  {
    let newsum = 0;
    Selected.map((menu) => {
      newsum += Menus[menu.id].price*menu.count;
    });
    setSum(newsum);

  }, [Selected]);
  return (
    <>
      <div className="top">
        <div className="drink-container">
          {Menus.map((menu, index) => {
            return (
              <div key={index}>
                <p onClick={() => AddMenu(index)}>{menu.name} </p>
              </div>
            );
          })}
        </div>

        <div className="right-container">
          <div className="choice-container">
            {Selected.map((selected, index) => {
              return (
                <div key={index} className="menu">
                  <p>{Menus[selected.id].name} x{selected.count}</p>
                  <button className="add-button" onClick = {() =>Change(index, 1)}>
                    +
                  </button>
                  <button className="del-button" onClick = { () => Change(index, -1)}>
                    -
                  </button>
                </div>
              );
            })}
          </div>
    
          <div className="clear-button-container">
            <button className="clear-button ALLCA" onClick={() => ALLCLEAR()}>
              ALLCA
            </button>
            <button className="clear-button" onClick={() => SetSelected([])}>
              クリア
            </button>
          </div>

          <div className="sum-container">
            <p>合計</p>
            <p>{Sum}円</p>
          </div>

          <div className="total-inserted-container">
            <p>投入済み</p>
            <p>{Put}円</p>
          </div>

          <div className="change-container">
            <p>お釣り</p>
            <p>{Put-Sum}円</p>
          </div>
        </div>
      </div>

      <div className="money-button-containersuper">
        <div className="button1">
          <div className="mbutton-row">
            <div className="mbutton" onClick={() => AddPut(100)}>100</div>
            <div className="mbutton"  onClick={() => AddPut(500)}>500</div>
            <div className="mbutton"  onClick={() => AddPut(1000)}>1000</div>
          </div>
          <div className="mbutton-row">
          <div className="mbutton"  onClick={() => AddPut(2000)}>2000</div>
          <div className="mbutton"  onClick={() => AddPut(3000)}>3000</div>
          <div className="mbutton"  onClick={() => AddPut(5000)}>5000</div>
        </div>
        </div>
        

        <div className="button2">
          <div className="ca-button" onClick={() => setPut(0)}>
            CA
          </div>
          <div className="other-button" onClick={() => setShowCalculator(true)}>
            他
          </div>
        </div>
      </div>

      {showCalculator && (
        <div className="calculator-modal">
          <div className="calculator-container">
            <div className="calculator-display">
              {calculatorDisplay}
            </div>
            <div className="calculator-buttons">
              <button onClick={handleCalculatorClear} className="calc-btn clear">C</button>
              <button onClick={handleCalculatorCancel} className="calc-btn cancel">X</button>
              <button onClick={handleCalculatorEnter} className="calc-btn enter">決定</button>
              <button onClick={() => handleCalculatorNumber("1")} className="calc-btn">1</button>
              <button onClick={() => handleCalculatorNumber("2")} className="calc-btn">2</button>
              <button onClick={() => handleCalculatorNumber("3")} className="calc-btn">3</button>
              <button onClick={() => handleCalculatorNumber("4")} className="calc-btn">4</button>
              <button onClick={() => handleCalculatorNumber("5")} className="calc-btn">5</button>
              <button onClick={() => handleCalculatorNumber("6")} className="calc-btn">6</button>
              <button onClick={() => handleCalculatorNumber("7")} className="calc-btn">7</button>
              <button onClick={() => handleCalculatorNumber("8")} className="calc-btn">8</button>
              <button onClick={() => handleCalculatorNumber("9")} className="calc-btn">9</button>
              <button onClick={() => handleCalculatorNumber("0")} className="calc-btn zero">0</button>
              <button onClick={() => handleCalculatorNumber("00")} className="calc-btn">00</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}