const fs = require('fs');

const raw = `User 1	747259	5831
Md. Masum	747260	9472
User 2	747344	2619
Anirban	842943	7048
Khalid Hossain	842944	3895
Md. Tusarujjaman	842945	9162
Golam Rabbani Asif	842946	4720
Mortoza Rahman	842949	8357
Sadia Tahsin Aurin	842950	1296
Sujoy Kumar Paul	842951	6684
Md. Sazib Hossain	842954	2503
Md. Sagor Ali	842955	7918
Md. Sakil Sheikh	842956	4306
Tanzil Hasan Ovi	842957	9821
Nazmul Haque Jayan	842959	3174
Pratik Biswas	842961	8642
Ripon Saha	842962	5097
Erina Tonni	842963	2738
Md. Torikul Islam	842964	6459
Ratul Hossen	842965	1187
Md. Asif Mosaddek	842967	7563
Nirab Kumar Adhikari	842969	9045
Md Khalid Hasan Abir	842971	3621
Sheikh Abdullah	842974	4879
Md. Musa Bepari	842977	6952
Shuvo Sarkar	842978	1408
Swopnil Kumar Kundu	842980	8236
Md. Shahriar Sifat	842981	5710
Md Asrafujjaman	842984	2685
Protik Saha	842985	7394
Md. Ashadul Islam	842986	4512
Junayed Al Habib	842987	8067
Lamim Islam	842988	3349
Shoriful Islam	842991	9780
Sabbir Sheikh	842992	2147
Mobarok Talukder	842996	6628
Md. Al Amin Hossain	842999	3951
Jubiar Rahaman Jony	843001	7204
Rafi Been Sawkot	843003	1589
Tamim Mia	843008	8473
Md. Sabbir Biswas	843010	2360
Md. Abdullah Mridha	843011	6915
Md. Sheemul Hossain	843012	4038
Dipto Saha	843014	9756
Md. Rayajul Islam	843015	2841
Md Shohidul Hasan	843016	6193
Amir Hamza	843017	5307
Sakibul Hasan Soikot	843018	1674
Sumaiya Akter	843019	8820
Md. Ashadul Islam	843021	2496
Ayub Hossen	843022	7138
Md. Jubraj Ahamed	843024	5642
Md. Apu Sheikh	843025	9081
Md. Sanvir Islam Shanto	843026	3275
Fatema Mahjaben Sneha	843027	6410
Md. Jubayear Shake	843029	1759
Md. Rakib Hosen	843030	4863
Simmy Akter	843031	7524
Bidhan Basak	843032	2190
Md. M.R. Tusar	843036	8306
User 3	886748	5682
User 4	886749	9413
User 5	886750	3078
User 6	888360	6249`;

const lines = raw.split('\n');
let newUsers = [];

newUsers.push("  { id: '1', name: 'Md. Mosharrof Hosen', role: 'teacher', student_id: '', roll_number: 'T001', subject: 'Generation of Electrical Power', attendance_percent: 0, password: '123456' },");
newUsers.push("  { id: '2', name: 'Md. Emarat Hossain', role: 'teacher', student_id: '', roll_number: 'T002', subject: 'Electrical & Electronic Measurement-I', attendance_percent: 0, password: '123456' },");

let idCounter = 3;
for (const line of lines) {
  if (!line.trim()) continue;
  let [name, roll, pass] = line.split('\t');
  name = name.trim();
  roll = roll.trim();
  pass = pass.trim();
  
  const role = roll === '843017' ? 'cr' : 'student';
  const student_id = "S" + idCounter.toString().padStart(3, '0');
  
  newUsers.push("  { id: '" + idCounter + "', name: '" + name + "', role: '" + role + "', student_id: '" + student_id + "', roll_number: '" + roll + "', subject: '', attendance_percent: 100, password: '" + pass + "' },");
  idCounter++;
}

const replacement = "export const MOCK_USERS: Profile[] = [\n" + newUsers.join("\n") + "\n];";

const filePath = 'd:/ET2324/constants/mockData.ts';
const content = fs.readFileSync(filePath, 'utf8');

const updated = content.replace(/export const MOCK_USERS: Profile\[\] = \[[\s\S]*?\];/, replacement);

fs.writeFileSync(filePath, updated);
console.log('Successfully updated MOCK_USERS in mockData.ts');
