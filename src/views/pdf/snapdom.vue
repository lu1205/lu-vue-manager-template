<script setup lang="ts">
import { ref } from 'vue'
import { snapdom } from '@zumer/snapdom'
import { pdfImage } from '@zumer/snapdom-plugins/pdf-image'

const cardRef = ref(null)

const capture = async () => {
  if (!cardRef.value) return
  const result = await snapdom(cardRef.value, {
    plugins: [pdfImage({ orientation: 'landscape' })],
  })
  await result.toPdfImage()
}

const tableData = [
  {
    date: '2016-05-03',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-02',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-04',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-01',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-08',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-06',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
  {
    date: '2016-05-07',
    name: 'Tom',
    state: 'California',
    city: 'Los Angeles',
    address: 'No. 189, Grove St, Los Angeles',
    zip: 'CA 90036',
  },
]
</script>

<template>
  <div class="pdf-container" ref="cardRef">
    <div class="card">
      <h3>Hello SnapDOM</h3>
      <p>This whole div will be captured.</p>
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div><div>
      在这种困难的抉择下, 本人思来想去, 寝食难安.而这些并不是完全重要, 更加重要的问题是,
      爱尔兰在不经意间这样说过, 越是无能的人，越喜欢挑剔别人的错儿。这不禁令我深思. 带着这些问题,
      我们来审视一下随机一段废话. 每个人都不得不面对这些问题. 在面对这种问题时,
      而这些并不是完全重要, 更加重要的问题是, 既然如何, 我认为, 我们都知道, 只要有意义,
      那么就必须慎重考虑.随机一段废话
    </div>
    <el-table :data="tableData" style="width: 100%">
      <el-table-column prop="date" label="Date" width="150" />
      <el-table-column label="Delivery Info">
        <el-table-column prop="name" label="Name" width="120" />
        <el-table-column label="Address Info">
          <el-table-column prop="state" label="State" width="120" />
          <el-table-column prop="city" label="City" width="120" />
          <el-table-column prop="address" label="Address" />
          <el-table-column prop="zip" label="Zip" width="120" />
        </el-table-column>
      </el-table-column>
    </el-table>
    <button @click="capture">Capture</button>
  </div>
</template>

<style scoped lang="less">
.pdf-container {
  width: 100%;
  height: 100%;
  background-color: #fff;
}
</style>
