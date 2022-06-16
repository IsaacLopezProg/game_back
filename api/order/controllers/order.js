'use strict';
// AGREGAMOS LA KEY PRIVADA DE STRIPE
const stripe = require("stripe")(
    "sk_test_51KnYeQBZytezFteHjr9U2aB1JqNDCA0sAmqjMbnEnWkJ7Xkfnodjl4LnYhukS1BBsaA0B2prSIk0XKPkZK61UJXI00homCwo24"
);

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */



module.exports = {
    // UTILIZAMOS LA FUNCION CREATE DE STRAPI
    async create(ctx) {
        // TRAEMOS LOS DATOS DEL CONTEXTO O LO DESTRUCTURAMOS
        const { token, products, idUser, AddressShipping } = ctx.request.body;
        // CREAMOS UNA VARIABLE QUE NOS SIRVA PARA SUMAR LOS VALORES
        let totalPayment = 0;
        // RECORREMOS A PRODUCT Y SUMAMOS EL VALOR DE PRICE EN CADA PRODUCTO A TOTAL_PAYMENT
        products.forEach((product) => {
            totalPayment = totalPayment + product.price;
        });

        // CREAMOS UNA NUEVA CONSTANTE QUE VA A GUARDAR LOS VALORES PARA CONFIRMAR 
        // EL PAGO CON STRAPI
        const charge = await stripe.charges.create({
            amount: totalPayment * 100,
            currency: "eur",
            source: token.id,
            description: `ID Usuario: ${idUser}`,
        });

        // CREAMOS UNA NUEVA VARIABLE PARA GUARDAR DE MANERA INDIVIDUAL LOS PRODUCTO DE LA ORDEN
        const createOrder = [];
        // RECORREMOS LOS PRODUCT PARA GUARDARLOS EN LA VARIABLE CREATE_ORDER
        // DEBE DE SER ESPESIFICAMENTE CON EL NOMBRE DE LOS ATRIBUTOS DEL MODELO QUE QUEREMOS GUARDAR
        for await (const product of products) {
            const data = {
                game: product.id,
                users_permissions_user: idUser,
                totalPayment,
                idPayment: charge.id,
                AddressShipping,
            };
            // CREAMOS UNA NUEVA VARIABLE PARA VALIDAR LOS DATOS EN EL MODELO
            const validData = await strapi.entityValidator.validateEntityCreation(
                strapi.models.order,
                data
            );

            // CREAMOS UNA NUEVA VARIABLE PARA YA VALIDADOS LOS DATOS, HACER EL GUARDADO
            // DENTRO DEL MODELO
            const entry = await strapi.query('order').create(validData);
            // INSERTAMOS LOS VALORES DENTRO DE NUESTRA VARIABLE CREATE_ORDER PARA MOSTRARLOS
            // DE MANERA INDIVIDUAL
            createOrder.push(entry);
        }

        // RETORNAMOS NUESTRA ARREGLO CON TODOS LOS DATOS GUARDADOS
        return createOrder;
    },
};
