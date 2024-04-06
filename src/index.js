import React, { useState, useEffect} from 'react';
import { useForm } from "react-hook-form";
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.css';
import './index.css';
import products from "./index.json"

const itemList = Object.keys(products["items"])

function App() {
  const [view, setView] = useState("browse");
  const [cart, setCart] = useState({});
  const [searchString, setSearchString] = useState("");
  const [images, setImages] = useState({});
  const [dataF, setDataF] = useState({});
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  useEffect(() => {
    const promises = itemList.map(item =>
      import(`${products["items"][item]["image"]}`).then(module => ({ item, src: module.default })).catch(error => ({ item, src: null }))
    );
    Promise.all(promises)
      .then(results => {
        const updatedImages = results.reduce((acc, { item, src }) => ({ ...acc, [item]: src }), {});
        setImages(updatedImages);
      });
  }, []);

  const changePage = (pageName) => {
    if(pageName==="browse") {
      setSearchString("");
    }
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
          <img src={images[item]} alt={item}  className="item-image"/><hr />
          {item}: <button onClick={() => removeItem(item)}>-</button><button onClick={() => addItem(item)}>+</button> {cart[item] ?? 0}<br/>
          {products["items"][item]["description"]}
        </li>
      ))}
    </ul>
  );

  const renderPage = () => {
    sumCart();
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

  const onSubmitCart = data => {
    setDataF(data);
    reset({
      "name": "",
      "email": "",
      "card": "",
      "address1": "",
      "address2": "",
      "city": "",
      "state": "",
      "zip": ""
    })
    changePage("confirmation")
  };

  const sumCart = () => {
    let sum = 0;
    for (let item in cart) {      
      sum += cart[item] * products["items"][item.charAt(0).toUpperCase() + item.slice(1)]["price"];
    }
    return sum.toFixed(2);
  }

  const CartPage = () => (
    <div>
      Cart<hr />
      <button onClick={() => changePage("browse")}>Return</button>
      <DisplayCart />
      <form id="classForm" onSubmit={handleSubmit(onSubmitCart)} className="container mt-5">
        <label>Full Name</label>
        <input {...register("name", { required: true })} className="form-control"></input>
        {errors.name && <p className="text-danger">Full name is required.</p>}
        <label>Email</label>
        <input {...register("email", { required: true, pattern: /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]+$/ })} className="form-control"></input>
        {errors.email && <p className="text-danger">Email is required.</p>}
        <label>Card</label>
        <input {...register("card", { required: true, pattern: /^[0-9]{16}$/})} className="form-control"></input>
        {errors.card && <p className="text-danger">A 16 digit card number is required.</p>}
        <label>Address 1</label>
        <input {...register("address1", { required: true })} className="form-control"></input>
        {errors.address1 && <p className="text-danger">Address is required.</p>}
        <label>Address 2</label>
        <input {...register("address2")} type="text" id="address2" name="address2" className="form-control"></input>
        <label>City</label>
        <input {...register("city", { required: true })} className="form-control"></input>
        {errors.city && <p className="text-danger">City is required.</p>}
        <label>State</label>
        <input {...register("state", { required: true })} className="form-control"></input>
        {errors.state && <p className="text-danger">State is required.</p>}
        <label>Zip</label>
        <input {...register("zip", { required: true, pattern: /^[0-9]{5}$/})} className="form-control"></input>
        {errors.zip && <p className="text-danger">A 5 digit ZIP code is required.</p>}
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );

  const resetPage = () => {
    changePage("browse");
    setCart({})
  };

  const ConfirmationPage = () => (
    <div>
      Confirmation<hr />
      <p3>Thank you for your purchase, {}</p3>
      <div>
        <h1>Purchase Summary:</h1>
        <DisplayCart />
        <h1>Total: {sumCart()}</h1>
      </div>
      <div>
      <h1>Payment Summary:</h1>
        <h3>{dataF.name}</h3>
        <p>{dataF.email}</p>
         ...
        <p>{dataF.city},{dataF.state} {dataF.zip} </p>
      </div>
      <button onClick={resetPage}>Home</button>
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
