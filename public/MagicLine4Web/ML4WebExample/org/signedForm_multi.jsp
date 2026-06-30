<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="utf-8"%>
<jsp:include page="include/header.jsp"></jsp:include>
<jsp:include page="include/menu.jsp"></jsp:include>
<script type="text/javascript">

//18.07.10
//1. 서명 원문 추가해서 signedForm_multi_R 에 서명 원문 데이터 파라미터 추가 
//2. 서명 원문 내용 출력 추가

// TODO : 반영할땐 result 출력 없이 해야됨.
var isResultShown = false;

function doSignData(){
	var signData = new Array();
	var signData1 = $("#signData1").val();
	var signData2 = $("#signData2").val();
	var signData3 = $("#signData3").val();
	var signData4 = $("#signData4").val();
	
	if(signData1.length < 1 || signData2.length < 1 || signData3.length < 1 || signData4.length < 1){
		alert('폼 데이터를 입력하세요.');
		$("#signData1").focus();
		return;
	}
	
	signData.push(signData1);
	signData.push(signData2);
	signData.push(signData3);
	signData.push(signData4);
	
	document.reqForm.signOrigin.value = signData;
	
	magicline.uiapi.MakeSignData( signData, null, mlCallBack);
}

// 서명 결과 데이터를 화면에 출력해주고 전송 버튼을 노출시켜주는 함수
function signResultDrawler(message){
	
	var htmlStream = "";
	
	if(typeof(message) === "undefiend"){
		alert('No message for signature. \nPlease make sure sign data');
		return;
	}
	
	for(var key in message){
		/*
		if(typeof message === "object"){
			
			var inMessage = JSON.stringify(message);
			
			for(var inKey in inMessage){
				htmlStream += '<tr>';
				htmlStream += '<td></td>';
				htmlStream += '	<td>' + inKey + '</td>';
				htmlStream += '	<td>' + inMessage[inKey] + '</td>';
				htmlStream += '</tr>';
					
			}
			
		}else{
		}
		
		*/
		
		if(typeof message[key] === "object"){
			htmlStream += '<tr>';			
			htmlStream += '	<td colspan="2"><b>' + key + '</b></td>';
			htmlStream += '</tr>';
			for(var inKey in message[key]){			
				htmlStream += "<tr>";
				htmlStream += '	<td>&nbsp;&nbsp;&nbsp;&nbsp;' + inKey + '</td>';	
				htmlStream += '	<td>' + message[key][inKey] + '</td>';
				htmlStream += "</tr>";
				
			}
		}else{
			htmlStream += '<tr>';			
			htmlStream += '	<td><b>' + key + '</b></td>';
			htmlStream += '	<td>' + message[key] + '</td>';
			htmlStream += '</tr>';
		}
			
				
	}
	
	htmlStream += '<tr>';
	htmlStream += '	<td colspan="2" class="buttonRow" align="center">';
	htmlStream += '		<input type="button" class="button" value="전송" name="Submit" onClick="this.form.submit();">';
	htmlStream += ' </td>';
	htmlStream += '</tr>';
	
	$("#signatureResultArea").html(htmlStream);
	
	if(!isResultShown){			
		isResultShown=true;			
		$("#signatureResultDiv").css("display", "");
	}
}

function mlCallBack(code, message){
	
	if(code==0){
		
		//message
		//alert(message.selectStorage);
		//alert(message.encMsg);
		document.reqForm.sign.value = encodeURIComponent( JSON.stringify(message.encMsg) );
		document.reqForm.submit();
		//결과값출력
		//signResultDrawler(message);
		
	}else{
		alert("결과값 수신에 실패하였습니다.");
		return;
	}
}


</script>
<div id="middle">
	<h2>MagicLine Digital Signature</h2>
	<div id="workArea"><!-- DIV START  -->
	
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
		<tr>		
			<th colspan="2">Description</th>		
		</tr>
		</thead>
		<tr>
			<td>&nbsp;&nbsp;웹 구간 전달 메시지 전체에 대해 클라이언트에서 전자서명을 실행합니다.</td>
		</tr>
	</table>
	
	<p>&nbsp;</p>
	<form id='reqForm' name='reqForm' method='post' action="./signedForm_multi_R.jsp">
	<!-- 결과 수신 메시지  -->
	<input type="hidden" id="signOrigin" name="signOrigin" /> <!-- 180701 서명 원문 폼 추가 -->
	<input type="hidden" id='sign' name='sign'/>
	<input type="hidden" id='csCheckType' name='csCheckType' value="1"/>
	
	<!-- 전자서명 데이터 입력 영역 -->
	<table style="width: 100%; height:100%"  class="styledLeft">
		<thead>
			<tr>
				<th colspan="2">Client Digital Signature Information</th>
			</tr>
		</thead>
		<tbody>
			<tr>
				<td class="formRow">
					<table class="normal" cellspacing="0" style="text-align: left;">
						<tr>
							<td>전자서명 원문 데이터 입력<font class="required">*</font></td>
							<td>
								<textarea id="signData1" name="signData1" rows="3" cols="60">test1</textarea>
								<textarea id="signData2" name="signData2" rows="3" cols="60">test2</textarea>
								<textarea id="signData3" name="signData3" rows="3" cols="60">test3</textarea>
								<textarea id="signData4" name="signData4" rows="3" cols="60">test4</textarea>
								<!-- <input class="text-box-big" id="signData" name="signData" type="text" value="">-->
							</td>
						</tr>
					</table>
				</td>
			</tr>
			<tr>
				<td colspan="2" class="buttonRow" align="center">
					<input id="aaa" type="button" class="button" value="전자서명" onclick="doSignData();">
				</td>
			</tr>
		</tbody>
	</table>
	<br>
	<!-- 전자서명 데이터 출력 영역 -->
	<div id="signatureResultDiv" style="display:none;" >
	<table style="width: 100%; height:100%"  class="styledLeft" >
		<thead>
			<tr>
				<th colspan="2">Signature Data Information</th>
			</tr>
		</thead>
		<tbody id="signatureResultArea">
		</tbody>
	
	</table>
		
	</div>
	</form>
	<p>&nbsp;</p>
	
	</div>
</div><!-- DIV END  -->
<div id="selectCertContainer1" style="width:100%;margin-top:0; display:none;"></div>
<div id="startCs" style="width:100%;margin-top:0; display:none;"></div>
<jsp:include page="include/footer.jsp"></jsp:include>