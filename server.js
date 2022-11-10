const app = require('./app')

console.log(process.env);

const port = 8000
app.listen(port, () => {
    console.log(`App is running on port ${port}`);
})

