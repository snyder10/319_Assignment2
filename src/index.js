import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import data from "./index.json"
console.log(data)
const itemList = Object.keys(data["items"])

function App() {
  const [view, setView] = useState("browse");
  const [cart, setCart] = useState({});
  const [searchString, setSearchString] = useState("");
  const [images, setImages] = useState({});

  useEffect(() => {
    const promises = itemList.map(item =>
      import(`${data["items"][item]["image"]}`).then(module => ({ item, src: module.default })).catch(error => ({ item, src: null }))
    );
    Promise.all(promises)
      .then(results => {
        const updatedImages = results.reduce((acc, { item, src }) => ({ ...acc, [item]: src }), {});
        setImages(updatedImages);
      });
  }, []);

  const changePage = (pageName) => {
    setView(pageName);
  };

  const addItem = (item) => {
    setCart(prevCart => ({ ...prevCart, [item]: (prevCart[item] || 0) + 1 }));
  };

  const removeItem = (item) => {
    setCart(prevCart => {
      const newCart = { ...prevCart };
      if (newCart[item] > 1) {
        newCart[item] -= 1;
      } else {
        delete newCart[item];
      }
      return newCart;
    });
  };

  const DisplayCart = () => {
    return (<ul className="cartDisplay">
      {
        Object.keys(cart).map(item => (
          <li key={item}>
            <img src={images[item]} alt={item} className="cartImage"/>
            <p>{item}: {cart[item]}</p>
          </li>
        ))
      }
    </ul>);
  };

  const Items = () => (
    <ul className="block">
      {itemList.filter(item => item.toLowerCase().includes(searchString.toLowerCase())).map(item => (
        <li key={item}>
          <img src={images[item]} alt={item}  className="image"/><hr />
          {item}: <button onClick={() => removeItem(item)}>-</button><button onClick={() => addItem(item)}>+</button> {cart[item] ?? 0}<br/>
          {data["items"][item]["description"]}
        </li>
      ))}
    </ul>
  );

  const renderPage = () => {
    switch (view) {
      case "browse":
        return <BrowsePage searchString={searchString} setSearchString={setSearchString} changePage={changePage} Items={Items} />;
      case "cart":
        return <CartPage />;
      case "confirmation":
        return <ConfirmationPage />;
      default:
        return <BrowsePage searchString={searchString} setSearchString={setSearchString} changePage={changePage} Items={Items} />;
    }
  };

  const verifyForm = (event) => {
    event.preventDefault()
    let re = new RegExp("^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$")
    if (!re.test(event.target[1].value)){
      event.target[1].style.backgroundColor = "yellow";
    } else {
      event.target[1].style.backgroundColor = "white";
    }

    re = new RegExp("^[0-9]{5}$");
    if(!re.test(event.target[7].value)){
      event.target[7].style.backgroundColor = "yellow";
    } else {
      event.target[7].style.backgroundColor = "white";
    }
  };

  const CartPage = () => (
    <div>
      Cart<hr />
      <button onClick={() => changePage("browse")}>Return</button>
      <DisplayCart />
      <form id="classForm" onSubmit={verifyForm}>
        <label forhtml="name">Full Name</label>
        <input type="text" id="name" name="name"></input>
        <label forhtml="email">Email</label>
        <input type="text" id="email" name="email"></input>
        <label forhtml="card">Card</label>
        <input type="text" id="card" name="card"></input>
        <label forhtml="address1">Address 1</label>
        <input type="text" id="address1" name="address1"></input>
        <label forhtml="address2">Address 2</label>
        <input type="text" id="address2" name="address2"></input>
        <label forhtml="city">City</label>
        <input type="text" id="city" name="city"></input>
        <label forhtml="state">State</label>
        <input type="text" id="state" name="state"></input>
        <label forhtml="zip">Zip</label>
        <input type="text" id="zip" name="zip"></input>
        <input type="submit" value="Submit" />
      </form>
    </div>
  );

  const ConfirmationPage = () => (
    <div>
      Confirmation<hr />
      {/* Implement confirmation view here */}
    </div>
  );

  return renderPage();
}

const BrowsePage = ({ searchString, setSearchString, changePage, Items }) => (
  <div>
    Browse<hr />
    <button onClick={() => changePage("cart")}>Cart</button>
      <input
        type="text"
        placeholder="Search..."
        value={searchString}
        onChange={(e) => setSearchString(e.target.value)}
      />
    <Items />
  </div>
);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
