import { useEffect, useState } from "react";
import "./Manage.css";
import type  { MenuItem } from "./App";
export const Manage = () => {
    const [Menus, setMenus] = useState<MenuItem[]>([]
    );

    const [isOnline, setIsOnline] = useState(false);

    const [inputName, setInputName] = useState("");

    const [inputPrice, setInputPrice] = useState<number | null>(null);

    const [Socket, setSocket] = useState<WebSocket | null>(null);

    const AddAction = () => {
        if (isOnline && Socket) {
            Socket.send(JSON.stringify({type:"add", name:inputName, price:inputPrice}));
            setInputName("");
            setInputPrice(null);
            return;
        }
        const menuData = localStorage.getItem("MENU");
        if (!menuData) return;
        
        let nowMenu = JSON.parse(menuData).MENU;
        nowMenu.push({
            name: inputName,
            price: inputPrice,
        });
        localStorage.setItem("MENU", JSON.stringify({"MENU":nowMenu}));
        setMenus(nowMenu);
        setInputName("");
        setInputPrice(null);
        return;
    }

    const DelAction = (index : number) => {
        if (isOnline && Socket) {
            Socket.send(JSON.stringify({type:"del", index:index}));
            return;
        }
        const menuData = localStorage.getItem("MENU");
        if (!menuData) return;
        
        let nowMenu = JSON.parse(menuData).MENU;
        nowMenu.splice(index, 1);
        localStorage.setItem("MENU", JSON.stringify({"MENU":nowMenu}));
        setMenus(nowMenu);
         setInputName("");
        setInputPrice(null);

    }

    useEffect(() => {
        const ws = new WebSocket("wss://main.hackwordserver-sasaki-unko.com:5000");
        ws.onopen = () => {
             ws.send(JSON.stringify({"type":"dataplz"}));
            setSocket(ws);
            setIsOnline(true);
          
        }
        ws.onerror = () => {
            if (localStorage.getItem("MENU") == null) {
                localStorage.setItem("MENU", JSON.stringify({"MENU":Menus}));
            }
            console.log("HI", localStorage.getItem("MENU"));
            const menuData = localStorage.getItem("MENU");
            if (menuData) {
                setMenus(JSON.parse(menuData).MENU);
            }
        }
        ws.onmessage = (ev) => {
            const data = JSON.parse(ev.data);
            console.log("RECIEVE");
            const Menus0 = data.Menu;
            let fixed: MenuItem[] = [];
            for (const menu of Menus0) {
                fixed.push({
                    name: menu.name,
                    price: menu.price,
                });
            }
            setMenus(fixed);
        }
    }, [])
    return (  
        <>
        <div className="Manage">
            <h1>Manage Page</h1>
            <div className="status">
                <p>{isOnline ? "Online" : "Local"} </p>
                <div className="switch-button">
                    switch
                </div>
            </div>
            <div className="input-form">
                <input type="" className="name-input" placeholder="商品名" value={inputName} onChange={(e) => setInputName(e.target.value)}/>
                <input type="number" className="price-input" placeholder="価格" value={inputPrice || ""} onChange={(e) => setInputPrice(e.target.value ? parseInt(e.target.value) : null)}/>
                <button className="add_button" onClick={() => AddAction()}>追加</button>
            </div>
            <div className="menu-container">
                {Menus.map((menu, index) => {
                    return (
                        <div className="single-menu">
                            <div className="menu-name">
                                {menu.name}
                            </div>

                            <div className="menu-price">
                                {menu.price}円
                            </div>

                            <div className="delete-button" onClick={() => DelAction(index)}>
                                削除
                            </div>
                        </div>
                    );
                })}
                
            </div>
        </div>
        </>
    );
}