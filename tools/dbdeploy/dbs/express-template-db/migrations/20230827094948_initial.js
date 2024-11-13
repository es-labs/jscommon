/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.schema.createTable('users', table => {
    table.increments('id').primary()
    table.string('groups')
    table.integer('orgId')
    table.string('username')
    table.string('email').unique('email')
    table.integer('githubId').unique('githubId').nullable()
    table.string('password') // hashed
    table.string('role')

    // retry limit
    table.integer('retryLimit', 3)
    table.integer('retryCount', 0)
    table.integer('retryReset', 30) // number of seconds before user can retry

    // authenticators
    table.string('gaKey', 32).comment('Google Authenticator Key')

    // push notification
    table.string('pnToken').defaultTo('')

    table.string('revoked').defaultTo('')
    table.string('refreshToken').defaultTo('')

    // SMS number
    table.string('sms')
    table.dateTime('smsLastSent')
    table.string('smsOtpPin', 6)
    table.integer('smsVerified') // need to verify sms

    // telegram
    table.string('telegramId')
    table.string('telegramUsername')
    // table.timestamps() // createdAt, updatedAt
  })
  await knex.schema.createTable('country', (table) => {
    table.increments('id').primary()
    table.string('name')
    table.string('code')
    table.string('icc')
    table.unique('code')
    table.unique('name')
  })
  await knex.schema.createTable('state', (table) => {
    table.increments('id').primary()
    table.string('country_name')
    table.string('code')
    table.string('name')
    table.unique(['country_name', 'code'])
  })
  await knex.schema.createTable('student', (table) => {
    table.increments('id').primary()
    table.string('firstName')
    table.string('lastName')
    table.string('avatar').defaultsTo('')
    table.string('kyc').defaultsTo('')
    table.string('sex')
    table.integer('age')
    table.decimal('gpa')
    table.date('birthDate')
    table.time('birthTime')
    table.string('country')
    table.string('state')
    table.datetime('dateTimeTz')
    table.string('website')
    table.string('remarks')
    table.string('updated_by')
    table.datetime('updated_at')      
    table.unique(['firstName', 'lastName'])
  })
  await knex.schema.createTable('subject', (table) => {
    table.string('code').primary()
    table.string('name')
    table.string('passingGrade')
  })
  await knex.schema.createTable('student_subject', (table) => {
    table.integer('studentId').unsigned().references('student.id')
    table.string('subjectCode').references('subject.code')
    table.string('gradeFinal')
    table.datetime('gradeDate')
    table.unique(['studentId', 'subjectCode']) // remove this and you will have duplicates
    table.index('studentId')
    // table.index([
    //   { column: "location" },
    //   { column: "time", order: "DESC" },
    // ]); // TBD indexing
  })
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.schema.dropTableIfExists('student_subject')
  await knex.schema.dropTableIfExists('student')
  await knex.schema.dropTableIfExists('state')
  await knex.schema.dropTableIfExists('country')
  await knex.schema.dropTableIfExists('subject')
  await knex.schema.dropTableIfExists('users')
}
