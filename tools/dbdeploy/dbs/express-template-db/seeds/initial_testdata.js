const mkDt = () => (new Date()).toISOString()

new Intl.DateTimeFormat('default', {
  year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC', hour12: false, formatMatcher: 'basic'
}).format(new Date())


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  await knex('student_subject').del()
  await knex('subject').del()
  await knex('student').del()
  await knex('award').del()
  await knex('country').del()
  await knex('state').del()

  await knex('country').insert( require('./icc.json') )
  await knex('state').insert( require('./state.json') )
  const students = [...new Array(30)].map( (_, idx) => {
    return {
      firstName: 'first',
      lastName: 'last' + idx,
      avatar: '',
      kyc: '',
      sex: idx % 2 === 0 ? 'M' : 'F',
      age: idx + 15,
      gpa: (idx + 1) % 5,
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
    { studentId: 1, subjectCode: 'PHY', gradeFinal: 'D', gradeDate: '2024-10-01' },
    { studentId: 2, subjectCode: 'EM', gradeFinal: 'C', gradeDate: '2024-10-02' },
    { studentId: 2, subjectCode: 'CHEM', gradeFinal: 'B', gradeDate: '2024-10-02' },
  ])
  await knex('award').insert( [ // studentId from insert above...
    { code: 'ac', name: 'Academic' },
    { code: 'sp', name: 'Sports' },
    { code: 'cv', name: 'Civics' },
 ])
}
