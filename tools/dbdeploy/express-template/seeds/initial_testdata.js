const mkDt = () => (new Date()).toISOString()

new Intl.DateTimeFormat('default', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC', hour12: false, formatMatcher: 'basic'
}).format(new Date())


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('books_authors').del()
  await knex('pages').del()
  await knex('books').del()
  await knex('authors').del()
  await knex('categories').del()
  await knex('student').del()
  await knex('country').del()
  await knex('state').del()

  await knex('authors').insert([
    {id: 1, name: 'author1', avatar: '', created_at: mkDt() },
    {id: 2, name: 'author2', avatar: '', created_at: mkDt() },
    {id: 3, name: 'author3', avatar: '', created_at: mkDt() },
    {id: 4, name: 'author4', avatar: '', created_at: mkDt() },
    {id: 5, name: 'author5', avatar: '', created_at: mkDt() }
  ])
  await knex('categories').insert([
    {id: 1, name: 'cat1', created_at: mkDt() },
    {id: 2, name: 'cat2', created_at: mkDt() },
    {id: 3, name: 'cat3', created_at: mkDt() }
  ])
  await knex('books').insert([
    {id: 1, name: 'book1', categoryId: 1, rating: 5, yearPublished: '2004', created_at: mkDt() },
    {id: 2, name: 'book2', categoryId: 2, rating: 4, yearPublished: '2003', created_at: mkDt() },
    {id: 3, name: 'book3', categoryId: 1, rating: 3, yearPublished: '2010', created_at: mkDt() },
    {id: 4, name: 'book4', categoryId: 1, rating: 2, yearPublished: '2009', created_at: mkDt() },
    {id: 5, name: 'book5', categoryId: 2, rating: 1, yearPublished: '2007', created_at: mkDt() }
  ])
  await knex('books_authors').insert([
    {authorId: 1, bookId: 1},
    {authorId: 2, bookId: 2},
    {authorId: 3, bookId: 3},
    {authorId: 1, bookId: 4},
    {authorId: 2, bookId: 4},
    {authorId: 2, bookId: 5}
  ])
  await knex('pages').insert([
    {id: 1, content: 'page1', bookId: 1, created_at: mkDt()},
    {id: 2, content: 'page2', bookId: 1, created_at: mkDt()},
    {id: 3, content: 'page3', bookId: 1, created_at: mkDt()},
    {id: 4, content: 'page4', bookId: 2, created_at: mkDt()},
    {id: 5, content: 'page5', bookId: 3, created_at: mkDt()},
    {id: 6, content: 'page6', bookId: 4, created_at: mkDt()},
    {id: 7, content: 'page7', bookId: 4, created_at: mkDt()},
    {id: 8, content: 'page8', bookId: 5, created_at: mkDt()}
  ])
  await knex('country').insert( require('./icc.json') )
  await knex('state').insert( require('./state.json') )
  const students = [...new Array(30)].map( (_, idx) => {
    return {
      firstName: 'first ' + idx,
      lastName: 'last',
      sex: idx % 2 === 0 ? 'M' : 'F',
      subjects: 'EM,PHY',
      age: idx + 15,
      gpa: 0,
      birthDate: '1976-04-19',
      birthTime: '0600',
      country: 'SG',
      state: '',
      dateTimeTz: (new Date()).toISOString(), // sqlite stores as integer...
      website: '',
      remarks: '',
      updated_by: 'someone',
      updated_at: (new Date()).toISOString() 
    }
  })
  await knex('student').insert(students)
  await knex('subject').insert( [
    { code: 'EL1', name: 'English', passingGrade: 'D' },
    { code: 'EM', name: 'E Math', passingGrade: 'C' },
    { code: 'AM', name: 'A Math', passingGrade: 'C' },
    { code: 'PHY', name: 'Physics', passingGrade: 'D' },
    { code: 'CHEM', name: 'Chemistry', passingGrade: 'D' },
  ])

  await knex('student_subject').insert( [ // studentId from insert above...
    { studentId: 1, subjectCode: 'EM', gradeFinal: 'A', gradeDate: '2024-10-01' },
    { studentId: 1, subjectCode: 'AM', gradeFinal: 'B', gradeDate: '2024-10-01' },
    { studentId: 1, subjectCode: 'PHY', gradeFinal: 'D', gradeDate: '2024-10-01' }
  ])
}
