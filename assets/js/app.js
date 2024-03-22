const cl = console.log;

const cardContainer = document.getElementById('cardContainer');
const postForm  = document.getElementById('postForm');
const titleControl = document.getElementById('title');
const contentControl= document.getElementById('content');
const userIdControl= document.getElementById('userId');
const loader= document.getElementById('loader');
const baseUrl= `https://machine-test-ac427-default-rtdb.asia-southeast1.firebasedatabase.app/`;
const postUrl= `${baseUrl}/posts.json`;

const hideLoader = () => {
    loader.classList.add("d-none");
}

const onDelete = async (ele) =>{
    Swal.fire({
        title: "Are you sure you want to delete this card?",
        icon: "warning",
        showCancelButton: true,
        //confirmButtonColor: "#3085d6",
       // cancelButtonColor: "#d33",
        confirmButtonText: "Delete !"
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: "Deleted!",
            text: "Your file has been deleted.",
            icon: "success"
          });
        }
      });
      
    let deleteId = ele.closest(".card").id;
    let deleteUrl = `${baseUrl}/posts/${deleteId}.json`;
    try{    
        let res= await makeApiCall("DELETE", deleteUrl)
        ele.closest(".card").remove();
        cl(res);
    }catch(err){
        cl(err)
    }
}

const onEdit = async (ele) => {
    let editId = ele.closest(".card").id;
    localStorage.setItem("editId", editId);
    let editUrl = `${baseUrl}/posts/${editId}.json`;
    try{
      let data = await makeApiCall("GET", editUrl);
      cl(data);
      titleControl.value = data.title;
      contentControl.value = data.content;
      userIdControl.value = data.userId;
      updateBtn.classList.remove("d-none");
      submitBtn.classList.add("d-none");
    }catch(err){
        
    }
}

const insertCard = (obj) => {
    let card = document.createElement("div");
        card.className = "card mb-4";
        card.id = obj.id;
        card.innerHTML = `
                            <div class="card-header">
                                <h4 class="m-0">${obj.title}</h4>
                            </div>
                             <div class="card-body">
                                <p class="m-0">${obj.content}</p>
                             </div>
                             <div class="card-footer d-flex justify-content-between">
                                <button class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                                <button class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                             </div>    
                        `;
                        cardContainer.append(card);

}

const cardTemplating = (arr) => {
    arr.forEach(obj => {
        insertCard(obj)
    })
} 

const objToArr = (data) => {
    let postArr =[];
        for(const key in data){
            let obj = {...data[key], id : key};
           // obj.id = key;
            cl(obj);
            postArr.push(obj)
        }
        return postArr;
}


const makeApiCall = async (methodName, apiUrl, msgBody) => {
    try{
        let msgInfo = msgBody ? JSON.stringify(msgBody) : null;
    loader.classList.remove("d-none");
   let res = await fetch(apiUrl, {
        method : methodName,
        body : msgInfo
    })
    return res.json()
    }catch(err){
        cl(err)
    }finally{
        hideLoader()
    }
}

const onPostCreate = async (eve) => {
    eve.preventDefault();
    try{
        let newPost = {
            title : titleControl.value,
            content : contentControl.value,
            userId : userIdControl.value
        }
        cl(newPost)
    
        let data = await makeApiCall("POST", postUrl, newPost);
        newPost.id = data.name;
        insertCard(newPost);
    }catch(err){
        cl(err)
    }finally{
        hideLoader();
        postForm.reset();
    }
}

const fetchPosts = async () => {
    try{
        let data = await makeApiCall("GET", postUrl);
        cl(data)
       let postArr = objToArr(data);
        cardTemplating(postArr)
    }catch(err){
    cl(err)
    }
}
fetchPosts()

const onPostUpdate = async () => {
    let updatedObj = {
        title : titleControl.value,
        content : contentControl.value,
        userId : userIdControl.value
    }
    try{
        let updateId = localStorage.getItem("editId");
        localStorage.removeItem("editId");
        let updateUrl = `${baseUrl}/posts/${updateId}.json`;
        let res = await makeApiCall("PATCH", updateUrl, updatedObj)
        let card = -[...document.getElementById(updateId).children];
        //cl(card)
        card[0].innerHTML = `<h4 class="m-0">${res.title}</h4>`;
        card[1].innerHTML = `<p class="m--0">${res.content}</p>`;
    }catch(err){

    }finally{
        postForm.reset();
    }

}

postForm.addEventListener("submit", onPostCreate);
updateBtn.addEventListener("click", onPostUpdate);