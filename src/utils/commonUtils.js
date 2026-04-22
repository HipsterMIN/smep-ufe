// 사용예시: onChange={(event) => setValue(keepDigitsOnly(event.target.value))}
// 입출력예시: keepDigitsOnly('12ab가34') => '1234'
// 기능: 입력값에서 숫자 외 문자를 제거하고 숫자만 반환한다.
export const keepDigitsOnly = (value) => String(value ?? '').replace(/[^0-9]/g, '');

// 사용예시: onChange={(event) => setValue(removeDigits(event.target.value))}
// 입출력예시: removeDigits('홍1길2동') => '홍길동'
// 기능: 입력값에서 숫자를 제거한 값을 반환한다.
export const removeDigits = (value) => String(value ?? '').replace(/[0-9]/g, '');

// 사용예시: onChange={(event) => setValue(removeKoreanCharacters(event.target.value))}
// 입출력예시: removeKoreanCharacters('abc한글@test.co.kr') => 'abc@test.co.kr'
// 기능: 입력값에서 한글 완성형과 자모를 제거한 값을 반환한다.
export const removeKoreanCharacters = (value) =>
  String(value ?? '').replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, '');
